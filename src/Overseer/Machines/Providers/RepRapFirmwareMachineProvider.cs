using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Overseer.Models;

namespace Overseer.Machines.Providers
{
  public class RepRapFirmwareMachineProvider : PollingMachineProvider<RepRapFirmwareMachine>
  {

    public RepRapFirmwareMachineProvider(RepRapFirmwareMachine machine)
    {
      Machine = machine;
    }

    protected override async Task<dynamic> Fetch(string resource, FetchRequest request = default, CancellationToken cancellation = default)
    {
      var password = string.IsNullOrWhiteSpace(Machine.Password) ? "reprap" : Machine.Password;
      var response = await base.Fetch("rr_connect", new() { Query = new() { { "password", password }, { "sessionKey", "yes" } } }, cancellation);

      request ??= new();
      request.Headers.TryAdd("X-Session-Key", response.sessionKey.ToString());
      return await base.Fetch(resource, request, cancellation);
    }

    Task<dynamic> FetchModel(string key = null, string flags = "d99fno", CancellationToken cancellation = default)
    {
      // https://github.com/Duet3D/RepRapFirmware/wiki/HTTP-requests#get-rr_model
      var query = new Dictionary<string, string>() { { "flags", flags } };
      if (!string.IsNullOrWhiteSpace(key))
      {
        query.Add("key", key);
      }

      return Fetch("rr_model", new() { Query = query }, cancellation: cancellation);
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
        var machineTools = new List<MachineTool>();
        var updatedMachine = machine as RepRapFirmwareMachine;
        // if the password is being updated it needs to be updated before 
        // making the web request, else it can't log in. 
        if (Machine.Password != updatedMachine.Password)
        {
          Machine.Password = updatedMachine.Password;
        }

        dynamic tools = await FetchModel("tools", string.Empty);
        dynamic heat = await FetchModel("heat", string.Empty);

        foreach (var bedIndex in heat.result.bedHeaters)
        {
          if (bedIndex < 0) continue;
          machineTools.Add(new MachineTool(MachineToolType.Heater, bedIndex, "bed"));
        }

        foreach (var chamberIndex in heat.result.chamberHeaters)
        {
          if (chamberIndex < 0) continue;
          machineTools.Add(new MachineTool(MachineToolType.Heater, chamberIndex, "chamber"));
        }

        foreach (var tool in tools.result)
        {
          foreach (var heaterIndex in tool.heaters)
            machineTools.Add(new MachineTool(MachineToolType.Heater, heaterIndex));

          foreach (var extruderIndex in tool.extruders)
            machineTools.Add(new MachineTool(MachineToolType.Extruder, extruderIndex));
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
      var modelResponse = await FetchModel(cancellation: cancellation);
      status.State = (string)modelResponse.result.state.status switch
      {
        "processing" or "resuming" => MachineState.Operational,
        "paused" or "pausing" => MachineState.Paused,
        _ => MachineState.Idle,
      };

      status.Temperatures = ReadTemperatures(modelResponse.result.heat);
      if (status.State == MachineState.Operational || status.State == MachineState.Paused)
      {
        // It looks like I can get everything with the single call except the fan speed.
        // The fan speeds are returned, but it wouldn't be possible to know which one to use
        // without fetching the tools to get the fan index for the active tool since Overseer
        // doesn't store that information. 
        // For me defaulting to the first one would work, because that is how my machines are setup.
        // However, that won't work for everyone. I don't think it's worth the making the 
        // extra call, or updating the Overseer model, to support this. At least at this time.
        // So it's going to work like the Octoprint provider.
        status.FanSpeed = 100;
        status.FeedRate = modelResponse.result.move.speedFactor * 100;

        status.FlowRates = [];
        Machine.Tools
          .Where(t => t.ToolType == MachineToolType.Extruder)
          .ToList()
          .ForEach(e => status.FlowRates.Add(e.Index, modelResponse.result.move.extruders[e.Index].factor * 100));

        status.ElapsedJobTime = modelResponse.result.job.duration;
        (int timeRemaining, float progress) completion = await CalculateCompletion(modelResponse.result);
        status.Progress = completion.progress;
        status.EstimatedTimeRemaining = completion.timeRemaining;
      }

      return status;
    }

    protected Dictionary<int, TemperatureStatus> ReadTemperatures(dynamic heat)
    {
      List<dynamic> heaters = heat.heaters.ToObject<List<dynamic>>();
      return Machine.Tools.Where(m => m.ToolType == MachineToolType.Heater).Select(m =>
      {
        var heater = heaters.ElementAt(m.Index);
        return new TemperatureStatus
        {
          Actual = heater.current,
          Target = heater.active,
          HeaterIndex = m.Index
        };
      })
      .ToDictionary(x => x.HeaterIndex);
    }

    static (int timeRemaining, float progress) CalculateCompletion(dynamic model)
    {
      if (model.job.file.filament?.Count > 0)
      {
        var filament = (IEnumerable<float>)model.job.file.filament.ToObject<IEnumerable<float>>();
        var totalFilament = filament.Aggregate((product, next) => product + next);
        var extrudedFilaments = (IEnumerable<dynamic>)model.move.extruders<IEnumerable<dynamic>>();
        var totalExtruded = extrudedFilaments.Aggregate((product, next) => product + next.rawPosition);
        var progress = totalExtruded / totalFilament * 100;

        return (model.job.timesLeft.filament, Math.Max(0, (float)Math.Round(progress, 1)));
      }

      if (model.job.timesLeft.slicer != null && model.job.timesLeft.slicer > 0)
      {
        var estimatedTotal = model.job.duration + model.job.timesLeft.slicer;
        var progress = model.job.timesLeft.slicer / estimatedTotal;
        return (model.job.timesLeft.slicer, Math.Max(0, (float)Math.Round(progress * 100)));
      }

      var fractionPrinted = model.job.filePosition / model.job.file.size * 100;
      return (model.job.file.timesLeft.file, fractionPrinted);
    }
  }
}
