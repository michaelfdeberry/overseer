using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Overseer.Machines.Octoprint.Models;
using Overseer.Models;

namespace Overseer.Machines.Octoprint;
public class OctoprintMachineProvider : PollingMachineProvider<OctoprintMachine>
{
  public OctoprintMachineProvider(OctoprintMachine machine)
  {
    Machine = machine;
  }

  protected FetchRequest PrepareRequest(FetchRequest request)
  {
    request ??= new();
    request.Headers.TryAdd("X-Api-Key", Machine.ApiKey);
    return request;
  }

  protected override Task Fetch(string resource, FetchRequest request = null, CancellationToken cancellation = default)
  {
    return base.Fetch(resource, PrepareRequest(request), cancellation);
  }

  protected override Task<T> Fetch<T>(string resource, FetchRequest request = null, CancellationToken cancellation = default)
  {
    return base.Fetch<T>(resource, PrepareRequest(request), cancellation);
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
      // if the api key is changing this needs to update right away. 
      if (updatedMachine.ApiKey != Machine.ApiKey)
      {
        Machine.ApiKey = updatedMachine.ApiKey;
      }

      //the api path will be auto generated, so make sure the machine has the root path
      updatedMachine.Url = ProcessUri(updatedMachine.Url, string.Empty).ToString();

      var settings = await Fetch<Settings>("api/settings");
      if (string.IsNullOrWhiteSpace(updatedMachine.WebCamUrl))
      {
        updatedMachine.WebCamUrl = ProcessUri(updatedMachine.Url, settings.WebCam.StreamUrl).ToString();

        if (settings.WebCam.FlipH)
        {
          updatedMachine.WebCamOrientation = WebCamOrientation.FlippedHorizontally;
        }
        if (settings.WebCam.FlipV)
        {
          updatedMachine.WebCamOrientation = WebCamOrientation.FlippedVertically;
        }
      }

      updatedMachine.AvailableProfiles.Clear();
      var profiles = await Fetch<PrinterProfiles>("api/printerprofiles");
      foreach (var profileProperty in profiles.Profiles)
      {
        var profile = profileProperty.Value;
        updatedMachine.AvailableProfiles.Add(profile.Id, profile.Name);

        if (profile.Current)
        {
          var tools = new List<MachineTool>();
          updatedMachine.Profile = profile.Name;

          if (profile.HeatedBed)
          {
            tools.Add(new MachineTool(MachineToolType.Heater, -1, "bed"));
          }

          if (profile.Extruder.SharedNozzle)
          {
            tools.Add(new MachineTool(MachineToolType.Heater, 0));
          }

          for (int i = 0; i < profile.Extruder.Count; i++)
          {
            if (!profile.Extruder.SharedNozzle)
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

  protected override async Task<MachineStatus> AcquireStatus(CancellationToken cancellationToken)
  {
    var printerStatus = await Fetch<Status>("api/printer", cancellation: cancellationToken);
    var status = new MachineStatus { MachineId = MachineId };
    // looping through the tools instead of relying on the response data
    Machine.Tools.Where(t => t.ToolType == MachineToolType.Heater).ToList().ForEach(t =>
    {
      var key = t.Index == -1 ? "bed" : $"tool{t.Index}";
      if (printerStatus.Temperature.TryGetValue(key, out var temp))
      {
        status.Temperatures.Add(t.Index, new()
        {
          HeaterIndex = t.Index,
          Actual = temp.Actual ?? 0,
          Target = temp.Target ?? 0
        });
      }
    });

    status.State = printerStatus.State.Flags switch
    {
      { Paused: true } or { Pausing: true } => MachineState.Paused,
      { Printing: true } or { Resuming: true } => MachineState.Operational,
      _ => MachineState.Idle
    };

    if (status.State == MachineState.Operational || status.State == MachineState.Paused)
    {
      var jobStatus = await Fetch<Job>("api/job", cancellation: cancellationToken);
      status.ElapsedJobTime = jobStatus.Progress.PrintTime;
      status.EstimatedTimeRemaining = jobStatus.Progress.PrintTimeLeft;
      status.Progress = Math.Round(jobStatus.Progress.Completion, 1);

      // these values can't be retrieved through the octoprint api, or from marlin by gcode, so it's not going
      // to be supported by the Octoprint provider, however the values are being defaulted here to replicate the 
      // Octoprint UI behavior upon refresh. 
      status.FanSpeed = 100;
      status.FeedRate = 100;
      status.FlowRates = Machine.Tools
          .Where(tool => tool.ToolType == MachineToolType.Extruder)
          .ToDictionary(tool => tool.Index, tool => 100d);
    }

    return status;
  }
}