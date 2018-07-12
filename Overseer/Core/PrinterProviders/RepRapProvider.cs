using log4net;
using Overseer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Overseer.Core.Exceptions;

namespace Overseer.Core.PrinterProviders
{
    public class RepRapProvider : RestPrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(RepRapProvider));

        string _url;

        protected override Uri ServiceUri => new Uri(_url);

        public RepRapProvider(Printer printer)
        {
            PrinterId = printer.Id;
            var config = (RepRapConfig)printer.Config;
            config.Url = new Uri(config.Url).ProcessUrl();

            _url = config.Url;
        }

        public override int PrinterId { get; }
        
        public override async Task CancelPrint()
        {
            await PausePrint();
            await base.CancelPrint();
        }

        public override async Task LoadConfiguration(Printer printer)
        {
            try
            {
                var config = (RepRapConfig)printer.Config;
                _url = new Uri(config.Url).ProcessUrl();

                dynamic status = await ExecuteRequest("rr_status", parameters: new[] { ("type", "1") });
                int toolCount = status.temps.heads.current.Count;
                printer.Config.HeatedBed = status.temps["bed"] != null;
                printer.Config.Tools = Enumerable.Range(0, toolCount).Select(i => string.Concat("tool", i)).ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Load Configuration Failure", ex);
                throw new OverseerException("Printer_ConnectFailure", printer);
            }
        }

        protected override async Task ExecuteGcode(string command)
        {
            try
            {
                await ExecuteRequest("rr_gcode", parameters: new[] { ("gcode", command) });
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
            dynamic printerStatus = await ExecuteRequest("rr_status", parameters: new[] { ("type", "3") }, cancellation: cancellationToken);

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

            return status;
        }

        /// <summary>
        /// This attempts to replicate what's being done by Duet Web Control to calculate the current progress. 
        /// </summary>
        async Task<float> CalculateProgress(dynamic statusUpdate, CancellationToken cancellationToken)
        {
            try
            {
                dynamic fileInfo = await ExecuteRequest("rr_fileinfo", cancellation: cancellationToken);
                if (fileInfo != null && fileInfo.err == 0)
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
            catch (Exception ex)
            {
                Log.Error("Calculate Progress Failure", ex);
            }

            //there was an issue with the file info, just use the fraction printed. 
            return statusUpdate.fractionPrinted < 0 ? 100 : statusUpdate.fractionPrinted;
        }
    }
}