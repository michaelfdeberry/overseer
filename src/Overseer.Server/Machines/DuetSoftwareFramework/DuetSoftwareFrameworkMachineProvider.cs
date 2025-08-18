using System.Net.WebSockets;
using System.Text;
using Newtonsoft.Json;
using Overseer.Machines.RepRapFirmware.Models;
using Overseer.Server.Channels;
using Overseer.Server.Machines.RepRapFirmware;
using Overseer.Server.Machines.RepRapFirmware.Models;
using Overseer.Server.Models;

namespace Overseer.Server.Machines.DuetSoftwareFramework;

public class DuetSoftwareFrameworkMachineProvider(
  DuetSoftwareFrameworkMachine machine,
  IMachineStatusChannel machineStatusChannel,
  IHttpClientFactory httpClientFactory
) : WebSocketMachineProvider<DuetSoftwareFrameworkMachine>(machineStatusChannel)
{
  public override DuetSoftwareFrameworkMachine Machine
  {
    get => machine;
    protected set => machine = value;
  }

  public override async Task ExecuteGcode(string command)
  {
    if (string.IsNullOrWhiteSpace(command))
      throw new ArgumentException("Command cannot be null or empty.", nameof(command));

    var client = httpClientFactory.CreateClient();
    var sessionKey = await GetSessionKey(client);
    if (sessionKey is not null)
    {
      client.DefaultRequestHeaders.Remove("X-Session-Key");
      client.DefaultRequestHeaders.Add("X-Session-Key", sessionKey);
    }

    var uri = new UriBuilder(Machine.Url!) { Path = "machine/code", Query = "async=true" }.Uri.ToString();
    var content = new StringContent(command, Encoding.UTF8, "text/plain");
    await client.PostAsync(uri, content);
  }

  private async Task<string> GetSessionKey(HttpClient client)
  {
    var password = string.IsNullOrWhiteSpace(Machine.Password) ? RepRapFirmwareMachine.DefaultPassword : Machine.Password;
    var connection = await client.GetFromJsonAsync<MachineConnectResponse>(
      new UriBuilder(Machine.Url!) { Path = "machine/connect", Query = $"password={password}" }.Uri
    );

    var sessionKey = connection?.SessionKey;
    if (sessionKey is null)
      throw new OverseerException("machine_connect_failure", Machine);

    return sessionKey;
  }

  protected override async Task<Uri> GetWebSocketUri()
  {
    if (Machine.WebSocketUri is null)
      throw new InvalidOperationException("WebSocket URI is not set for the machine.");

    var sessionKey = await GetSessionKey(httpClientFactory.CreateClient());
    return new UriBuilder(Machine.WebSocketUri) { Query = $"sessionKey={sessionKey}" }.Uri;
  }

  public override async Task LoadConfiguration(Machine machine)
  {
    try
    {
      Machine = (DuetSoftwareFrameworkMachine)machine;
      if (string.IsNullOrWhiteSpace(Machine.Url))
      {
        throw new OverseerException("invalid_request");
      }

      Machine.Url = new UriBuilder(Machine.Url)
      {
        Path = "/",
        Scheme = "http",
        Port = 80,
      }.Uri.ToString();

      var client = httpClientFactory.CreateClient();
      var sessionKey = await GetSessionKey(client);
      if (sessionKey is not null)
      {
        client.DefaultRequestHeaders.Remove("X-Session-Key");
        client.DefaultRequestHeaders.Add("X-Session-Key", sessionKey);
      }

      Machine.WebSocketUri = new UriBuilder(Machine.Url) { Path = "machine", Scheme = "ws" }.Uri;

      var model = await client.GetFromJsonAsync<ObjectModel>(new UriBuilder(Machine.Url) { Path = "machine/model" }.Uri);
      var tools = model?.Tools;
      var heat = model?.Heat;

      if (tools == null || heat == null)
        throw new OverseerException("machine_connect_failure");

      var machineTools = new List<MachineTool>();

      machineTools.AddRange([.. heat.BedHeaters.Where(i => i >= 0).Select(i => new MachineTool(MachineToolType.Heater, i, "bed"))]);
      machineTools.AddRange([.. heat.ChamberHeaters.Where(i => i >= 0).Select(i => new MachineTool(MachineToolType.Heater, i, "chamber"))]);

      foreach (var tool in tools)
      {
        machineTools.AddRange([.. tool.Heaters.Select(i => new MachineTool(MachineToolType.Heater, i))]);
        machineTools.AddRange([.. tool.Extruders.Select(i => new MachineTool(MachineToolType.Extruder, i))]);
      }

      Machine.Tools = machineTools;
    }
    catch (Exception ex)
    {
      Log.Error("Failed to load Duet Software Framework machine configuration.", ex);
      OverseerException.Unwrap(ex);
      throw new OverseerException("machine_connect_failure", Machine);
    }
  }

  protected override async Task HandleIncomingMessage(string messageText)
  {
    await AcknowledgeMessage();

    if (string.IsNullOrWhiteSpace(messageText))
      return;

    var message = JsonConvert.DeserializeObject<ObjectModel>(messageText);
    if (message is null)
      return;

    await ProcessStatusUpdate(message);
  }

  private async Task AcknowledgeMessage()
  {
    if (_webSocket is null)
      return;

    var message = new ArraySegment<byte>(Encoding.UTF8.GetBytes("OK\n"));
    await _webSocket.SendAsync(message, WebSocketMessageType.Text, true, _cancellationTokenSource?.Token ?? default);
  }

  private async Task ProcessStatusUpdate(ObjectModel model)
  {
    if (model is null)
      return;

    var nextStatus = new MachineStatus
    {
      MachineId = MachineId,
      State = model.State?.Status switch
      {
        RRFMachineStatus.Processing or RRFMachineStatus.Resuming => MachineState.Operational,
        RRFMachineStatus.Paused or RRFMachineStatus.Pausing => MachineState.Paused,
        _ => _lastStatus?.State ?? MachineState.Idle,
      },
    };

    if (model.Heat is not null)
    {
      nextStatus.Temperatures = ReadTemperatures(model.Heat);
    }
    else
    {
      nextStatus.Temperatures = _lastStatus?.Temperatures ?? [];
    }

    if (nextStatus.State == MachineState.Operational || nextStatus.State == MachineState.Paused)
    {
      var speedFactor = model.Move?.SpeedFactor;
      var extruders = model.Move?.Extruders;
      var tools = model.Tools;
      var activeTool = tools?.First(t => t.State == ToolState.Active);
      var fanIndex = activeTool?.Fans.ElementAt(0) ?? 0;

      nextStatus.ElapsedJobTime = model.Job?.Duration ?? _lastStatus?.ElapsedJobTime ?? 0;
      var file = model.Job?.File;
      if (file is not null)
      {
        var (timeRemaining, progress) = RepRapFirmwareMachineProvider.CalculateCompletion(model, extruders!, file!);
        nextStatus.Progress = progress;
        nextStatus.EstimatedTimeRemaining = timeRemaining;
      }
      else
      {
        nextStatus.Progress = _lastStatus?.Progress ?? 0;
        nextStatus.EstimatedTimeRemaining = _lastStatus?.EstimatedTimeRemaining ?? 0;
      }
    }

    lock (_statusLock)
    {
      if (_lastStatus is not null && _lastStatus.Equals(nextStatus))
        return;

      _lastStatus = nextStatus;
      _lastStatusUpdate = DateTime.UtcNow;
    }

    await MachineStatusChannel.WriteAsync(nextStatus, _cancellationTokenSource?.Token ?? default);
  }

  public Dictionary<int, TemperatureStatus> ReadTemperatures(Heat heat)
  {
    return Machine
      .Tools.Where(m => m.ToolType == MachineToolType.Heater)
      .Select(m =>
      {
        var heater = heat.Heaters.ElementAt(m.Index);
        if (heater.Current == 0)
        {
          return _lastStatus?.Temperatures?.GetValueOrDefault(m.Index)
            ?? new TemperatureStatus
            {
              Actual = 0,
              Target = 0,
              HeaterIndex = m.Index,
            };
        }

        return new TemperatureStatus
        {
          Actual = heater.Current,
          Target = heater.Active,
          HeaterIndex = m.Index,
        };
      })
      .ToDictionary(x => x.HeaterIndex);
  }
}
