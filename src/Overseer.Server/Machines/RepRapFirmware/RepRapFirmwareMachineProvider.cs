using Overseer.Machines.RepRapFirmware.Models;
using Overseer.Server.Channels;
using Overseer.Server.Machines.RepRapFirmware.Models;
using Overseer.Server.Models;

namespace Overseer.Server.Machines.RepRapFirmware;

public class RepRapFirmwareMachineProvider(RepRapFirmwareMachine machine, IMachineStatusChannel machineStatusChannel)
  : PollingMachineProvider<RepRapFirmwareMachine>
{
  public override RepRapFirmwareMachine Machine
  {
    get => machine;
    protected set => machine = value;
  }

  protected override IMachineStatusChannel StatusChannel => machineStatusChannel;

  protected async Task<FetchRequest> PrepareRequest(FetchRequest? request, CancellationToken cancellation = default)
  {
    var password = string.IsNullOrWhiteSpace(Machine.Password) ? "reprap" : Machine.Password;
    var response = await base.Fetch<ConnectResponse>(
      "rr_connect",
      new()
      {
        Query = new() { { "password", password }, { "sessionKey", "yes" } },
      },
      cancellation
    );

    request ??= new();
    request.Headers.TryAdd("X-Session-Key", response.SessionKey.ToString());
    return request;
  }

  protected override async Task Fetch(string resource, FetchRequest? request = null, CancellationToken cancellation = default)
  {
    await base.Fetch(resource, await PrepareRequest(request, cancellation), cancellation);
  }

  protected override async Task<T> Fetch<T>(string resource, FetchRequest? request = null, CancellationToken cancellation = default)
  {
    return await base.Fetch<T>(resource, await PrepareRequest(request, cancellation), cancellation);
  }

  async Task<T?> FetchModel<T>(string? key = null, string flags = "d99fno", CancellationToken cancellation = default)
  {
    var query = new Dictionary<string, string>() { { "flags", flags } };
    if (!string.IsNullOrWhiteSpace(key))
    {
      query.Add("key", key);
    }

    var response = await Fetch<ModelResponse<T>>("rr_model", new() { Query = query }, cancellation: cancellation);
    return response.Result;
  }

  public override async Task CancelJob()
  {
    await PauseJob();
    await base.CancelJob();
  }

  public override async Task ExecuteGcode(string command)
  {
    await Fetch("rr_gcode", new() { Query = new() { { "gcode", command } } });
  }

  public override async Task LoadConfiguration(Machine machine)
  {
    try
    {
      var updatedMachine = (RepRapFirmwareMachine)machine;
      // if the password is being updated it needs to be updated before
      // making the web request, else it can't log in.
      if (Machine.Password != updatedMachine.Password)
      {
        Machine.Password = updatedMachine.Password;
      }

      var tools = await FetchModel<IEnumerable<Tool>>("tools", string.Empty);
      var heat = await FetchModel<Heat>("heat", string.Empty);
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

      updatedMachine.Tools = machineTools;
      Machine = updatedMachine;
    }
    catch (Exception ex)
    {
      Log.Error("Load Configuration Failure", ex);
      OverseerException.Unwrap(ex);
      throw new OverseerException("machine_connect_failure", Machine);
    }
  }

  protected override async Task<MachineStatus> AcquireStatus(CancellationToken cancellation)
  {
    var status = new MachineStatus { MachineId = MachineId };
    var model = await FetchModel<ObjectModel>(cancellation: cancellation);
    if (model == null)
      return status;

    status.State = model.State?.Status switch
    {
      RRFMachineStatus.Processing or RRFMachineStatus.Resuming => MachineState.Operational,
      RRFMachineStatus.Paused or RRFMachineStatus.Pausing => MachineState.Paused,
      _ => MachineState.Idle,
    };

    status.Temperatures = ReadTemperatures(model.Heat!);
    if (status.State == MachineState.Operational || status.State == MachineState.Paused)
    {
      var speedFactor = await FetchModel<double>("move.speedFactor", string.Empty, cancellation);
      var extruders = await FetchModel<List<Extruder>>("move.extruders", string.Empty, cancellation);
      var tools = await FetchModel<IEnumerable<Tool>>("tools", string.Empty, cancellation);
      var activeTool = tools?.First(t => t.State == ToolState.Active);
      var fanIndex = activeTool?.Fans.ElementAt(0) ?? 0;
      status.FanSpeed = model.Fans.ElementAt(fanIndex).RequestedValue * 100;
      status.FeedRate = speedFactor * 100;
      status.FlowRates = [];
      Machine
        .Tools.Where(t => t.ToolType == MachineToolType.Extruder)
        .ToList()
        .ForEach(e => status.FlowRates.Add(e.Index, (double)extruders!.ElementAt(e.Index).Factor * 100));

      status.ElapsedJobTime = model.Job?.Duration ?? 0;
      var (timeRemaining, progress) = await CalculateCompletion(model, extruders!, cancellation);
      status.Progress = progress;
      status.EstimatedTimeRemaining = timeRemaining;
    }

    return status;
  }

  protected Dictionary<int, TemperatureStatus> ReadTemperatures(Heat heat)
  {
    return Machine
      .Tools.Where(m => m.ToolType == MachineToolType.Heater)
      .Select(m =>
      {
        var heater = heat.Heaters.ElementAt(m.Index);
        return new TemperatureStatus
        {
          Actual = heater.Current,
          Target = heater.Active,
          HeaterIndex = m.Index,
        };
      })
      .ToDictionary(x => x.HeaterIndex);
  }

  async Task<(int timeRemaining, double progress)> CalculateCompletion(
    ObjectModel model,
    IEnumerable<Extruder> extruders,
    CancellationToken cancellation
  )
  {
    var file = await FetchModel<GCodeFileInfo>("job.file", string.Empty, cancellation);
    if (file?.Filament?.Count > 0)
    {
      var totalFilament = file.Filament.Aggregate((product, next) => product + next);
      var totalExtruded = extruders.Select(x => x.RawPosition).Aggregate((product, next) => product + next);
      var progress = totalExtruded / totalFilament * 100d;

      return (model.Job?.TimesLeft?.Filament ?? 0, Math.Max(0d, Math.Round(progress, 1)));
    }

    if (model.Job?.TimesLeft?.Slicer != null && model.Job.TimesLeft?.Slicer > 0 && model.Job.Duration != null)
    {
      var estimatedTotal = model.Job.Duration + model.Job.TimesLeft?.Slicer;
      var progress = model.Job?.TimesLeft?.Slicer / estimatedTotal * 100f;

      return (model.Job?.TimesLeft?.Slicer ?? 0, Math.Max(0, Math.Round(progress ?? -1 * 100)));
    }

    var fractionPrinted = model.Job?.FilePosition / file?.Size * 100f;
    return (model.Job?.TimesLeft?.File ?? 0, fractionPrinted ?? 0);
  }
}
