using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using Overseer.Machines.Elegoo.Models;
using Overseer.Models;

using Timer = System.Timers.Timer;

namespace Overseer.Machines.Elegoo;

public class ElegooMachineProvider : MachineProvider<ElegooMachine>
{
  const int PING_COMMAND = 0;
  const int PAUSE_COMMAND = 129;
  const int RESUME_COMMAND = 131;
  const int CANCEL_COMMAND = 130;
  const int PRINTER_COMMANDS = 403;
  const int ENABLE_CAMERA_COMMAND = 386;

  Timer _timer;
  DateTime? _lastStatusUpdate;

  Message _lastMessage = null;

  private ClientWebSocket _webSocket;

  public override event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

  public ElegooMachineProvider(ElegooMachine machine)
  {
    Machine = machine;
  }

  public override Task SetToolTemperature(int heaterIndex, int targetTemperature)
  {
    return SendCommand(new { TempTargetNozzle = targetTemperature });
  }

  public override Task SetBedTemperature(int targetTemperature)
  {
    return SendCommand(new { TempTargetHotbed = targetTemperature });
  }

  public override Task SetFlowRate(int extruderIndex, int percentage)
  {
    // unsupported
    return Task.CompletedTask;
  }

  public override Task SetFeedRate(int percentage)
  {
    return SendCommand(new { PrintSpeedPct = percentage });
  }

  public override async Task SetFanSpeed(int percentage)
  {
    if (_lastMessage == null) return;

    await SendCommand(new
    {
      TargetFanSpeed = new
      {
        ModelFan = percentage,
        _lastMessage.Status.CurrentFanSpeed.AuxiliaryFan,
        _lastMessage.Status.CurrentFanSpeed.BoxFan,
      }
    });
  }

  public override Task ExecuteGcode(string command)
  {
    // may not be supported
    return Task.CompletedTask;
  }

  public override async Task ResumeJob()
  {
    await SendCommand(RESUME_COMMAND);
  }

  public override async Task PauseJob()
  {
    await SendCommand(PAUSE_COMMAND);
  }

  public override async Task CancelJob()
  {
    await SendCommand(CANCEL_COMMAND);
  }

  public override Task LoadConfiguration(Machine machine)
  {
    Machine = machine as ElegooMachine;

    Machine.Url = new UriBuilder(Machine.IpAddress)
    {
      Path = "/",
      Scheme = "http"
    }.Uri.ToString();

    // fixed camera and orientation
    Machine.WebCamUrl = new UriBuilder(Machine.IpAddress)
    {
      Port = 3031,
      Path = "/video",
      Scheme = "http"
    }.Uri.ToString();

    Machine.WebCamOrientation = WebCamOrientation.Default;

    // one bed, one hot end, and one extruder
    // Currently only supports the Centauri machine, but may work with other single extruder Elegoo machines
    Machine.Tools = [
      new (MachineToolType.Heater, 0, "bed"),
        new (MachineToolType.Heater, 1),
        new (MachineToolType.Extruder, 0),
      ];

    return Task.CompletedTask;
  }

  public override void Start(int interval)
  {
    Task.Run(Connect);
    _timer?.Dispose();
    _timer = new(interval);

    _timer.Elapsed += (sender, args) =>
    {
      if (_lastStatusUpdate.HasValue && DateTime.UtcNow.Subtract(_lastStatusUpdate.Value).TotalMilliseconds <= interval)
      {
        // there has been no updates, so we can just send the last message again
        ReceiveMessage(_lastMessage);
        return;
      }

      if (_webSocket != null && _webSocket.State == WebSocketState.Open)
      {
        // if the web socket is open, but hasn't received a message in the last interval
        // it's likely idle, and just hasn't sent a message send a ping to get a response
        SendCommand(PING_COMMAND);
        return;
      }

      // otherwise, the connection is in a bad state 
      _webSocket?.Dispose();
      _webSocket = null;
      Task.Run(Connect);
    };
    _timer.Start();
  }

  public override void Stop()
  {
    _timer?.Stop();
    _timer?.Dispose();
    _timer = null;

    if (_webSocket != null)
    {
      _webSocket.Dispose();
      _webSocket = null;
    }
  }

  async Task Connect()
  {
    var webSocketUrl = new UriBuilder(Machine.IpAddress)
    {
      Port = 3030,
      Path = "/websocket",
      Scheme = "ws"
    };

    _webSocket = new ClientWebSocket();
    await _webSocket.ConnectAsync(webSocketUrl.Uri, default);
    await SendCommand(PING_COMMAND);
    await SendCommand(ENABLE_CAMERA_COMMAND, new { Enabled = 1 });

    var receiver = Task.Run(async () =>
    {
      while (true)
      {
        if (_webSocket.State != WebSocketState.Open)
        {
          break;
        }

        var buffer = new byte[1024];
        var receiveResult = await _webSocket.ReceiveAsync(buffer, default);
        var messageText = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
        var message = JsonSerializer.Deserialize<Message>(messageText);
        if (message != null)
        {
          ReceiveMessage(message);
        }
      }
    });

    await receiver;
  }

  void ReceiveMessage(Message message)
  {
    if (message.Status == null)
    {
      // this is a command response, not a status update
      return;
    }

    var status = new MachineStatus
    {
      MachineId = Machine.Id,
      State = message.Status.PrintInfo.Status switch
      {
        (int)ElegooMachineState.Printing => MachineState.Operational,
        (int)ElegooMachineState.Resuming => MachineState.Operational,
        (int)ElegooMachineState.Paused => MachineState.Paused,
        (int)ElegooMachineState.Pausing => MachineState.Paused,
        _ => MachineState.Idle
      },
      Temperatures = new()
      {
        { 0, new TemperatureStatus { HeaterIndex = 0, Actual = message.Status.TempOfHotbed, Target = message.Status.TempTargetHotbed } },
        { 1, new TemperatureStatus { HeaterIndex = 1, Actual = message.Status.TempOfNozzle, Target = message.Status.TempTargetNozzle } },
      }
    };

    if (status.State != MachineState.Idle)
    {
      // if it's not idle, we can get the progress and estimated time remaining
      status.Progress = message.Status.PrintInfo.Progress;
      status.EstimatedTimeRemaining = (int)(message.Status.PrintInfo.TotalTicks - message.Status.PrintInfo.CurrentTicks);
      status.ElapsedJobTime = (int)message.Status.PrintInfo.CurrentTicks;
      status.FeedRate = message.Status.PrintInfo.PrintSpeedPct;
      status.FanSpeed = message.Status.CurrentFanSpeed.ModelFan;
      // the flow rate is not available from the printer, just default to 100%
      status.FlowRates = new() { { 0, 100f } };
    }

    StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(status));

    _lastMessage = message;
    _lastStatusUpdate = DateTime.UtcNow;
  }

  Task SendCommand(object data)
  {
    return SendCommand(PRINTER_COMMANDS, data);
  }

  Task SendCommand(int command)
  {
    var message = new
    {
      Cmd = command,
      Data = new { },
      RequestID = Guid.NewGuid().ToString("N"),
      MainboardID = "",
      Timestamp = ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeMilliseconds(),
      From = "1"
    };
    return SendMessage(message);
  }

  Task SendCommand(int command, object data)
  {
    var message = new
    {
      Id = string.Empty,
      Data = new
      {
        Cmd = command,
        Data = data,
        RequestID = Guid.NewGuid().ToString("N"),
        Timestamp = ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeMilliseconds(),
        MainboardID = "",
        From = "1"
      },
    };
    return SendMessage(message);
  }

  async Task SendMessage(object message)
  {
    var messageText = JsonSerializer.Serialize(message);
    var buffer = Encoding.UTF8.GetBytes(messageText);
    await _webSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, default);
  }
}
