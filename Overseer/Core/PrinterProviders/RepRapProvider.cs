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
            config.Url = new Uri(config.Url).ProcessUrl();

            _url = config.Url;
        }

        public override int PrinterId { get; }

        public override async Task LoadConfiguration(Printer printer)
        {
            var config = (RepRapConfig)printer.Config;
            _url = new Uri(config.Url).ProcessUrl();

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

        protected override async Task ExecuteGcode(string command)
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

        protected override async Task<PrinterStatus> AcquireStatus(CancellationToken cancellationToken)
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