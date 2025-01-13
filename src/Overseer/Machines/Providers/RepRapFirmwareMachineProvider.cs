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

        foreach (int bedIndex in heat.result.bedHeaters)
        {
          if (bedIndex < 0) continue;
          machineTools.Add(new MachineTool(MachineToolType.Heater, bedIndex, "bed"));
        }

        foreach (int chamberIndex in heat.result.chamberHeaters)
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
        var move = await FetchModel("move", string.Empty, cancellation);
        var tools = await FetchModel("tools", string.Empty, cancellation);
        var toolList = tools.result.ToObject<List<dynamic>>() as List<dynamic>;
        var activeTool = toolList.First(t => t.state == "active");
        var fanIndex = (int)activeTool.fans[0];
        status.FanSpeed = (float)modelResponse.result.fans[fanIndex].requestedValue * 100;
        status.FeedRate = (float)move.result.speedFactor * 100;
        status.FlowRates = [];
        Machine.Tools
          .Where(t => t.ToolType == MachineToolType.Extruder)
          .ToList()
          .ForEach(e => status.FlowRates.Add(e.Index, (float)move.result.extruders[e.Index].factor * 100));

        status.ElapsedJobTime = modelResponse.result.job.duration;
        (int timeRemaining, float progress) completion = await CalculateCompletion(modelResponse.result, cancellation);
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

    async Task<(int timeRemaining, float progress)> CalculateCompletion(dynamic model, CancellationToken cancellation)
    {
      var file = await FetchModel("job.file", string.Empty, cancellation);
      if (file.result.filament?.Count > 0)
      {
        var filament = (IEnumerable<float>)file.result.filament.ToObject<IEnumerable<float>>();
        var totalFilament = filament.Aggregate((product, next) => product + next);
        var extrudedFilaments = (IEnumerable<dynamic>)model.move.extruders.ToObject<IEnumerable<dynamic>>();
        var totalExtruded = extrudedFilaments.Select(x => (float)x.rawPosition).Aggregate((product, next) => product + next);
        var progress = totalExtruded / totalFilament * 100;

        return (model.job.timesLeft.filament, Math.Max(0, (float)Math.Round(progress, 1)));
      }

      if (model.job.timesLeft.slicer != null && model.job.timesLeft.slicer > 0)
      {
        var estimatedTotal = model.job.duration + model.job.timesLeft.slicer;
        var progress = model.job.timesLeft.slicer / estimatedTotal;
        return (model.job.timesLeft.slicer, Math.Max(0, (float)Math.Round(progress * 100)));
      }

      var fractionPrinted = model.job.filePosition / file.result.size * 100;
      return (model.job.file.timesLeft.file, fractionPrinted);
    }
  }
}
