using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Overseer.Models;

namespace Overseer.Machines.Providers
{
  public class OctoprintMachineProvider : PollingMachineProvider<OctoprintMachine>
  {
    public OctoprintMachineProvider(OctoprintMachine machine)
    {
      Machine = machine;
    }

    protected override Task<dynamic> Fetch(string resource, FetchRequest request = default, CancellationToken cancellation = default)
    {
      request ??= new();
      request.Headers.TryAdd("X-Api-Key", Machine.ApiKey);
      return base.Fetch(resource, request, cancellation);
    }

    /// <summary>
    /// This uses the Octoprint API to pause the print,
    /// this is needed because the Gcode command only works
    /// when printing from SD, where as when printing from 
    /// Octoprint the commands are streamed to the printer.
    /// </summary>
    public override Task PauseJob()
    {
      return Fetch("api/job", new() { Method = "POST", Body = new { command = "pause", action = "pause" } });
    }

    /// <summary>
    /// This uses the Octoprint API to resume the print,
    /// this is needed because the Gcode command only works
    /// when printing from SD, where as when printing from 
    /// Octoprint the commands are streamed to the printer.
    /// </summary>
    public override Task ResumeJob()
    {
      return Fetch("api/job", new() { Method = "POST", Body = new { command = "pause", action = "resume" } });
    }

    /// <summary>
    /// This uses the Octoprint API to cancel the print,
    /// this is needed because the Gcode command only works
    /// when printing from SD, where as when printing from 
    /// Octoprint the commands are streamed to the printer.
    /// </summary>
    public override Task CancelJob()
    {
      return Fetch("api/job", new() { Method = "POST", Body = new { command = "cancel" } });
    }

    public override Task ExecuteGcode(string command)
    {
      return Fetch("api/printer/command", new() { Method = "POST", Body = new { command } });
    }

    public override async Task LoadConfiguration(Machine machine)
    {
      try
      {
        OctoprintMachine updatedMachine = machine as OctoprintMachine;
        //the api path will be auto generated, so make sure the machine has the root path
        updatedMachine.Url = ProcessUri(updatedMachine.Url, string.Empty).ToString();

        var settings = await Fetch("api/settings");
        if (string.IsNullOrWhiteSpace(updatedMachine.WebCamUrl))
        {
          updatedMachine.WebCamUrl = ProcessUri(updatedMachine.Url, (string)settings["webcam"]["streamUrl"]).ToString();

          if ((bool)settings["webcam"]["flipH"])
          {
            updatedMachine.WebCamOrientation = WebCamOrientation.FlippedHorizontally;
          }
          else if ((bool)settings["webcam"]["flipV"])
          {
            updatedMachine.WebCamOrientation = WebCamOrientation.FlippedVertically;
          }
        }

        updatedMachine.AvailableProfiles.Clear();
        dynamic profiles = await Fetch("api/printerprofiles");
        foreach (dynamic profileProperty in profiles["profiles"])
        {
          var profile = profileProperty.Value;
          updatedMachine.AvailableProfiles.Add((string)profile.id, (string)profile.name);

          if ((bool)profile.current)
          {
            var tools = new List<MachineTool>();
            updatedMachine.Profile = profile.name;

            if ((bool)profile.heatedBed)
            {
              tools.Add(new MachineTool(MachineToolType.Heater, -1, "bed"));
            }

            int extruderCount = profile.extruder.count;
            bool sharedNozzle = profile.extruder.sharedNozzle;

            if (sharedNozzle)
            {
              tools.Add(new MachineTool(MachineToolType.Heater, 0));
            }

            for (int i = 0; i < extruderCount; i++)
            {
              if (!sharedNozzle)
              {
                tools.Add(new MachineTool(MachineToolType.Heater, i));
              }

              tools.Add(new MachineTool(MachineToolType.Extruder, i));
            }

            updatedMachine.Tools = tools;
          }
        }

        Machine = updatedMachine;
      }
      catch (Exception ex)
      {
        Log.Error("Load Configuration Failure", ex);

        //checks if the exception, or any inner exceptions, is an overseer exception and if so throws it
        OverseerException.Unwrap(ex);

        if (ex.Message.Contains("Invalid API key"))
          throw new OverseerException("octoprint_invalid_key", Machine);

        throw new OverseerException("machine_connect_failure", Machine);
      }
    }

    private int GetHeaterIndex(string heaterKey)
    {
      if (heaterKey.ToLower() == "bed") return -1;
      return Convert.ToInt32(heaterKey.Replace("tool", string.Empty));
    }

    protected override async Task<MachineStatus> AcquireStatus(CancellationToken cancellationToken)
    {
      dynamic machineState = await Fetch("api/printer", cancellation: cancellationToken);
      var status = new MachineStatus { MachineId = MachineId };

      foreach (dynamic pair in machineState.temperature)
      {
        var heaterIndex = GetHeaterIndex(pair.Name);
        status.Temperatures.Add(heaterIndex, new TemperatureStatus
        {
          HeaterIndex = heaterIndex,
          Actual = pair.Value.actual,
          Target = pair.Value.target
        });
      }

      var flags = machineState.state.flags;
      if ((bool)flags.operational)
      {
        if ((bool)flags.paused || (bool)flags.pausing)
        {
          status.State = MachineState.Paused;
        }
        else if ((bool)flags.printing || (bool)flags.resuming)
        {
          status.State = MachineState.Operational;
        }
        else
        {
          status.State = MachineState.Idle;
        }

        var jobStatus = await Fetch("api/job", cancellation: cancellationToken);
        status.ElapsedJobTime = (int?)jobStatus["progress"]["printTime"] ?? 0;
        status.EstimatedTimeRemaining = (int?)jobStatus["progress"]["printTimeLeft"] ?? 0;
        status.Progress = (float)Math.Round((float?)jobStatus["progress"]["completion"] ?? 0f, 1);

        // these values can't be retrieved through the octoprint api, or from marlin by gcode, so it's not going
        // to be supported by the Octoprint provider, however the values are being defaulted here to replicate the 
        // Octoprint UI behavior upon refresh. 
        status.FanSpeed = 100;
        status.FeedRate = 100;
        status.FlowRates = Machine.Tools
            .Where(tool => tool.ToolType == MachineToolType.Extruder)
            .ToDictionary(tool => tool.Index, tool => 100f);
      }
      else
      {
        status.State = MachineState.Idle;
      }

      return status;
    }
  }
}