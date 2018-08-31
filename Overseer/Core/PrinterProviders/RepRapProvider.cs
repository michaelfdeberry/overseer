using log4net;
using Overseer.Core.Exceptions;
using Overseer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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
                AddClientCertificate(config.ClientCertificatePem);

                _url = new Uri(config.Url).ProcessUrl();

                dynamic status = await ExecuteRequest("rr_status", parameters: new[] { ("type", "2") });                
                printer.Config.HeatedBed = status.temps["bed"] != null;
                printer.Config.Tools = Enumerable.Range(0, (int)status.tools.Count)
                    .Select(i => string.Concat("tool", i))
                    .ToList();
            }
            catch (Exception ex)
            {
                Log.Error("Load Configuration Failure", ex);
                throw new OverseerException("printer_connect_failure", printer);
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
            dynamic machineStatus = await ExecuteRequest("rr_status", parameters: new[] { ("type", "2") }, cancellation: cancellationToken);
            switch ((string)machineStatus.status)
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

            void AddTemperature(string name, float actual, float target)
            {
                status.Temperatures[name] = new TemperatureStatus
                {
                    Name = name,
                    Actual = actual,
                    Target = target
                };
            }

            void AddAuxiliaryTemperature(string name)
            {
                AddTemperature(name, machineStatus.temps[name].current, machineStatus.temps[name].active);
            }

            for (var heaterIndex = 0; heaterIndex < machineStatus.temps.current.Count; heaterIndex++)
            {
                if (machineStatus.temps["bed"] != null && machineStatus.temps.bed.heater == heaterIndex)
                {
                    AddAuxiliaryTemperature("bed");
                }
                else if (machineStatus.temps["chamber"] != null && machineStatus.temps.chamber.heater == heaterIndex)
                {
                    AddAuxiliaryTemperature("chamber");
                }
                else if (machineStatus.temps["cabinet"] != null && machineStatus.temps.cabinet.heater == heaterIndex)
                {
                    AddAuxiliaryTemperature("cabinet");
                }
                else //it's a tool
                {
                    for (var toolIndex = 0; toolIndex < machineStatus.tools.Count; toolIndex++)
                    {
                        var tool = machineStatus.tools[toolIndex];
                        if (tool.heaters.ToObject<List<int>>().Contains(heaterIndex))
                        {
                            var actualTemp = machineStatus.temps.current[heaterIndex];
                            var targetTemp = machineStatus.temps.tools.active[toolIndex][tool.heaters.ToObject<List<int>>().IndexOf(heaterIndex)];

                            //Only showing the temp for the active heater for a tool with multiple heaters should be fine. However, I have no experience
                            //with multiple heaters on a tool. My assumption is that inactive heaters won't have an active temp only standby. 
                            //For now the temp for the tool will overwrite any existing temp, this should work find for tools with single heaters.
                            //When the need arises support for multiple heaters on a tool can be added. 
                            AddTemperature($"tool{tool.number}", actualTemp, targetTemp);
                            break;
                        }
                    }
                }
            }

            //if there is an active print job get the print status
            if (status.State == PrinterState.Printing || status.State == PrinterState.Paused)
            {
                dynamic printStatus = await ExecuteRequest("rr_status", parameters: new[] { ("type", "3") }, cancellation: cancellationToken);
                var parameters = printStatus["params"];
                var extruderFactors = ((IEnumerable<float>)parameters.extrFactors.ToObject<IEnumerable<float>>()).ToList();

                for (var flowRateIndex = 0; flowRateIndex < extruderFactors.Count; flowRateIndex++)
                {
                    status.FlowRates.Add($"tool{flowRateIndex}", extruderFactors.ElementAt(flowRateIndex));
                }

                status.FeedRate = parameters.speedFactor;
                status.ElapsedPrintTime = printStatus.printDuration;
                status.EstimatedTimeRemaining = printStatus.timesLeft.file;
                status.FanSpeed = GetFanSpeed(printStatus, machineStatus);
                status.Progress = await CalculateProgress(printStatus, cancellationToken);
            }
            
            return status;
        }

        int? _printFanIndex;
        float GetFanSpeed(dynamic statusUpdate, dynamic printerConfiguration)
        {
            var parameters = statusUpdate["params"];
            if (parameters == null) return 0; 
            if (parameters["fanPercent"] == null) return 0;
            
            if (!_printFanIndex.HasValue)
            {           
                var tools = printerConfiguration.tools;
                var currentToolIndex = (int)statusUpdate.currentTool;
                var currentTool = tools[currentToolIndex];

                if (currentTool == null) return 0;
                if (currentTool["fans"] == null) return 0;

                var currentToolFanMask = (int)currentTool.fans;
                var controllableFans = (int)printerConfiguration.controllableFans;
                var fanPercentCount = parameters.fanPercent.Count;
                for (var fanIndex = 0; fanIndex < Math.Min(controllableFans, fanPercentCount); fanIndex++)
                {
                    if ((currentToolFanMask & (1 << fanIndex)) != 0)
                    {
                        _printFanIndex = fanIndex;
                        break;                        
                    }
                }
            }
            
            return parameters.fanPercent[_printFanIndex];
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
                        var progress = statusUpdate.coords.xyz[2] / fileInfo.height * 100;
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