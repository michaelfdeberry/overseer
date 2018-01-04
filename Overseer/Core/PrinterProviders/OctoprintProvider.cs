using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Octoprint;
using Overseer.Core.Models;

namespace Overseer.Core.PrinterProviders
{
    public class OctoprintProvider : PrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OctoprintProvider));
        string _apiKey;
        OctoprintApi _octoprint;

        string _url;

        public OctoprintProvider(Printer printer)
        {
            PrinterId = printer.Id;
            var config = (OctoprintConfig) printer.Config;

            _url = NormalizeOctoprintUrl(config);
            _apiKey = config.ApiKey;

            _octoprint = new OctoprintApi(_url, _apiKey);
        }

        public override int PrinterId { get; }

        public override Task SetToolTemperature(string toolName, int targetTemperature)
        {
            return _octoprint.PrinterOperations.SetToolTarget(toolName, targetTemperature);
        }

        public override Task SetBedTemperature(int targetTemperature)
        {
            return _octoprint.PrinterOperations.SetBedTarget(targetTemperature);
        }

        public override Task SetFlowRate(string toolName, int percentage)
        {
            return _octoprint.PrinterOperations.Flowrate(toolName, percentage);
        }

        public override Task SetFeedRate(int percentage)
        {
            return _octoprint.PrinterOperations.Feedrate(percentage);
        }

        public override Task SetFanSpeed(int percentage)
        {
            var speed = (int) (255 * (percentage / 100f));
            return _octoprint.PrinterOperations.SendCommand($"M106 S{speed}");
        }

        public override Task PausePrint()
        {
            return _octoprint.JobOperations.Pause();
        }

        public override Task ResumePrint()
        {
            return _octoprint.JobOperations.Resume();
        }

        public override Task CancelPrint()
        {
            return _octoprint.JobOperations.Cancel();
        }

        public override async Task LoadConfiguration(Printer printer)
        {
            try
            {
                var config = (OctoprintConfig) printer.Config;
                if (_url != NormalizeOctoprintUrl(config) || _apiKey != config.ApiKey)
                {
                    _url = config.Url;
                    _apiKey = config.ApiKey;
                    _octoprint = new OctoprintApi(_url, _apiKey);
                }

                var settings = await _octoprint.Settings.GetSettings();
                var profiles = await _octoprint.PrinterProfileOperations.GetPrinterProfiles();
                var profile = profiles.Profiles.Values.FirstOrDefault(x => x.Name == config.Profile?.Name) ??
                              profiles.Profiles.Values.First(x => x.Current);

                config.HeatedBed = profile.HeatedBed;
                config.WebCamUrl = new Uri(config.Url).GetLocalUrl(settings.Webcam.StreamUrl);
                config.SnapshotUrl = new Uri(config.Url).GetLocalUrl(settings.Webcam.SnapshotUrl);
                config.Tools = Enumerable.Range(0, profile.Extruder.Count).Select(index => $"tool{index}").ToList();
                config.Profile = new OctoprintProfile {Id = profile.Id, Name = profile.Name};
                config.AvailableProfiles = profiles.Profiles.Values
                    .Select(x => new OctoprintProfile {Id = x.Id, Name = x.Name})
                    .ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Load Configuration Failure", ex);
            }
        }

        protected override async Task<PrinterStatus> GetPrinterStatusImpl(CancellationToken cancellationToken)
        {
            var status = new PrinterStatus { PrinterId = PrinterId };
            var stateResponse = await _octoprint.PrinterOperations.GetPrinterState().WithCancellation(cancellationToken);            
            var flags = stateResponse.State.Flags;

            if (flags.Printing || flags.Paused)
            {
                status.State = flags.Paused ? PrinterState.Paused : PrinterState.Printing;

                var jobStatus = await _octoprint.JobOperations.GetJobStatus();
                status.ElapsedPrintTime = jobStatus.Progress.PrintTime ?? 0;
                status.EstimatedTimeRemaining = jobStatus.Progress.PrintTimeLeft ?? 0;
                status.Progress = jobStatus.Progress.Completion ?? 0;
            }
            else
            {
                status.State = PrinterState.Idle;
            }

            status.Temperatures = stateResponse.Temperature.ToDictionary(kvp => kvp.Key, kvp => new TemperatureStatus
            {
                Name = kvp.Key,
                Actual = kvp.Value.Actual,
                Target = kvp.Value.Target
            });

            return status;
        }

        static string NormalizeOctoprintUrl(OctoprintConfig config)
        {
            return new Uri(config.Url).GetLocalUrl("/api");
        }
    }
}