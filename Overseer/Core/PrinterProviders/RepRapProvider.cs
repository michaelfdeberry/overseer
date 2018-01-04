using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Newtonsoft.Json.Linq;
using Overseer.Core.Models;

namespace Overseer.Core.PrinterProviders
{
    public class RepRapProvider : PrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(RepRapProvider));
        
        string _url;

        public RepRapProvider(Printer printer)
        {
            PrinterId = printer.Id;
            var config = (RepRapConfig) printer.Config;
            config.Url = new Uri(config.Url).GetLocalUrl();

            _url = config.Url;
        }

        public override int PrinterId { get; }

        public override Task SetToolTemperature(string toolName, int targetTemperature)
        {
            return ExecuteGcode($"G10 P{toolName.Last()} S{targetTemperature}");
        }

        public override Task SetBedTemperature(int targetTemperature)
        {
            return ExecuteGcode($"M140 S{targetTemperature}");
        }

        public override Task SetFlowRate(string toolName, int percentage)
        {
            return ExecuteGcode($"M221 D{toolName.Last()} S{percentage}");
        }

        public override Task SetFeedRate(int percentage)
        {
            return ExecuteGcode($"M220 S{percentage}");
        }

        public override Task SetFanSpeed(int percentage)
        {
            return ExecuteGcode($"M106 S{percentage / 100}");
        }

        public override Task PausePrint()
        {
            return ExecuteGcode("M25");
        }

        public override Task ResumePrint()
        {
            return ExecuteGcode("M24");
        }

        public override Task CancelPrint()
        {
            return ExecuteGcode("M0");
        }

        public override async Task LoadConfiguration(Printer printer)
        {
            var config = (RepRapConfig)printer.Config;
            _url = new Uri(config.Url).GetLocalUrl();

            using (var httpClient = new HttpClient())
            {
                var uri = new Uri($"{_url}/rr_status?type=1");
                var statusJson = await httpClient.GetStringAsync(uri);
                dynamic status = JObject.Parse(statusJson);

                int toolCount = status.temps.heads.current.Count;
                printer.Config.HeatedBed = status.temps["bed"] != null;
                printer.Config.Tools = Enumerable.Range(0, toolCount).Select(i => string.Concat("tool", i)).ToList();
            }
        }

        async Task ExecuteGcode(string command)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    await client.GetAsync(new Uri($"{_url}/rr_gcode?gcode={Uri.EscapeDataString(command)}"));
                }
            }
            catch (Exception ex)
            {
                Log.Error($"Failed to execute gcode: {command}", ex);
                throw;
            }
        }

        protected override async Task<PrinterStatus> GetPrinterStatusImpl(CancellationToken cancellationToken)
        {
            var status = new PrinterStatus { PrinterId = PrinterId };
            using (var httpClient = new HttpClient())
            {
                var uri = new Uri($"{_url}/rr_status?type=3");                
                var response = await httpClient.GetAsync(uri, cancellationToken);
                var statusJson = await response.Content.ReadAsStringAsync();
                dynamic printerStatus = JObject.Parse(statusJson);

                switch ((string)printerStatus.status)
                {
                    case "P":
                    case "R":
                        status.State = PrinterState.Printing;
                        break;
                    case "D":
                    case "S":
                        status.State = PrinterState.Paused;
                        break;
                    default:
                        status.State = PrinterState.Idle;
                        break;
                }

                status.ElapsedPrintTime = printerStatus.printDuration;
                status.EstimatedTimeRemaining = printerStatus.timesLeft.file;
                status.Progress = await CalculateProgress(printerStatus, cancellationToken);
                status.Temperatures = new Dictionary<string, TemperatureStatus>();
                status.FanSpeed = printerStatus.sensors.fanRPM;

                if (printerStatus.temps["bed"] != null)
                    status.Temperatures.Add("bed", new TemperatureStatus
                    {
                        Name = "bed",
                        Actual = printerStatus.temps.bed.current,
                        Target = printerStatus.temps.bed.active
                    });

                for (var i = 0; i < printerStatus.temps.heads.current.Count; i++)
                {
                    var name = string.Concat("tool", i);
                    var currentTemp = printerStatus.temps.heads.current[i];
                    var targetTemp = printerStatus.temps.heads.active[i];

                    status.Temperatures.Add(name, new TemperatureStatus
                    {
                        Name = name,
                        Actual = currentTemp,
                        Target = targetTemp
                    });
                }
            }

            return status;
        }

        /// <summary>
        /// This attempts replicates what's being done by Duet Web Control to calculate the current progress. 
        /// </summary>
        async Task<float> CalculateProgress(dynamic statusUpdate, CancellationToken cancellationToken)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    var uri = new Uri($"{_url}/rr_fileinfo");
                    var response = await client.GetAsync(uri, cancellationToken);
                    var fileInfoJson = await response.Content.ReadAsStringAsync();
                    dynamic fileInfo = JObject.Parse(fileInfoJson);

                    if (fileInfo.err == 0)
                    {
                        if (fileInfo.filament.Count > 0)
                        {
                            //determine progress based on the amount of filament used compared to how much is required
                            var filament = (IEnumerable<float>)fileInfo.filament.ToObject<IEnumerable<float>>();
                            var rawFilament = (IEnumerable<float>)statusUpdate.extrRaw.ToObject<IEnumerable<float>>();
                            var totalFilament = filament.Aggregate((product, next) => product + next);
                            var totalRawFilament = rawFilament.Aggregate((product, next) => product + next);
                            var progress = totalRawFilament / totalFilament * 100;

                            return progress < 0 ? 0 : progress.Round(1);
                        }

                        if (fileInfo.height > 0)
                        {
                            //determine the progress based on the current height compared to the total print height
                            var progress = statusUpdate.coords.xyx[2] / fileInfo.height * 100;
                            return progress < 0 ? 0 : progress.round(1);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error("Calculate Progress Failure", ex);
            }

            //there was an issue with the file info, just use the fraction printed. 
            return statusUpdate.fractionPrinted < 0 ? 100 : statusUpdate.fractionPrinted;
        }
    }
}