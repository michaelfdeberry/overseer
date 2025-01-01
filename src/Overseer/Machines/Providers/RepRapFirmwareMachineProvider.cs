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

        public override async Task CancelJob()
        {
            await PauseJob();
            await base.CancelJob();
        }

        public override async Task ExecuteGcode(string command)
        {
            await Fetch("rr_gcode", query: [("gcode", command)]);
        }

        public override async Task LoadConfiguration(Machine machine)
        {
            try
            {
                var updatedMachine = machine as RepRapFirmwareMachine;
                dynamic status = await Fetch("rr_status", query: [("type", "2")]);

                var tools = new List<MachineTool>();
                MachineTool.AuxiliaryHeaterTypes.ToList().ForEach(auxToolType =>
                {
                    var auxTool = status["temps"][auxToolType];
                    if (auxTool != null)
                    {
                        tools.Add(new MachineTool(MachineToolType.Heater, (int)auxTool["heater"], auxToolType));
                    }
                });

                foreach (var tool in status["tools"])
                {
                    List<int> heaters = tool["heaters"].ToObject<List<int>>();
                    List<int> extruders = tool["drives"].ToObject<List<int>>();
                    heaters.ForEach(heaterIndex => tools.Add(new MachineTool(MachineToolType.Heater, heaterIndex)));
                    extruders.ForEach(extruderIndex => tools.Add(new MachineTool(MachineToolType.Extruder, extruderIndex)));
                }

                updatedMachine.Tools = tools;
                Machine = updatedMachine;
            }
            catch (Exception ex)
            {
                Log.Error("Load Configuration Failure", ex);
                OverseerException.Unwrap(ex);
                throw new OverseerException("machine_connect_failure", Machine);
            }
        }

        protected override async Task<MachineStatus> AcquireStatus(CancellationToken cancellationToken)
        {
            var status = new MachineStatus { MachineId = MachineId };
            dynamic machineStatus = await Fetch("rr_status", query: [("type", "2")], cancellation: cancellationToken);

            switch ((string)machineStatus.status)
            {
                case "P":
                case "R":
                    status.State = MachineState.Operational;
                    break;
                case "D":
                case "S":
                    status.State = MachineState.Paused;
                    break;
                default:
                    status.State = MachineState.Idle;
                    break;
            }

            status.Temperatures = ReadTemperatures(machineStatus);

            //if there is an active job get the status
            if (status.State == MachineState.Operational || status.State == MachineState.Paused)
            {
                dynamic jobStatus = await Fetch("rr_status", query: [("type", "3")], cancellation: cancellationToken);

                var parameters = jobStatus["params"];
                List<float> extruderFactors = parameters.extrFactors.ToObject<List<float>>();

                status.FanSpeed = ReadFanSpeed(jobStatus, machineStatus);
                status.FeedRate = parameters.speedFactor;
                status.ElapsedJobTime = jobStatus.printDuration;
                status.FlowRates = Enumerable.Range(0, extruderFactors.Count)
                    .ToDictionary(index => index, index => extruderFactors[index]);

                (int timeRemaining, float progress) completion = await CalculateCompletion(jobStatus, cancellationToken);
                status.Progress = completion.progress;
                status.EstimatedTimeRemaining = completion.timeRemaining;
            }

            return status;
        }

        protected Dictionary<int, TemperatureStatus> ReadTemperatures(dynamic machineStatus)
        {
            Dictionary<int, TemperatureStatus> temperatures = new Dictionary<int, TemperatureStatus>();

            var tools = machineStatus.tools;
            var temps = machineStatus.temps;
            List<int> currentTemps = temps.current.ToObject<List<int>>();
            for (var heaterIndex = 0; heaterIndex < currentTemps.Count; heaterIndex++)
            {
                var currentHeater = Machine.GetHeater(heaterIndex);
                if (currentHeater == null) continue;

                if (MachineTool.AuxiliaryHeaterTypes.Contains(currentHeater.Name))
                {
                    var auxiliaryTemp = temps[currentHeater.Name];
                    if (auxiliaryTemp == null) continue;

                    temperatures.Add(currentHeater.Index, new TemperatureStatus
                    {
                        HeaterIndex = currentHeater.Index,
                        Actual = auxiliaryTemp.current,
                        Target = auxiliaryTemp.active
                    });
                }
                else
                {
                    //Overseer doesn't have a concept of tools similar to RRF, just heaters and drives. 
                    //So no matter the configuration it will just list all the heaters and drives. So,
                    //something like a tool changing system with 2 tool heads each configured with 
                    //a dual extruder setup it will show up as 4 heaters and 4 drives. Or, 2 heaters and 4 drives
                    //in a shared nozzle configuration. 
                    for (int toolIndex = 0; toolIndex < tools.Count; toolIndex++)
                    {
                        var tool = tools[toolIndex];
                        if (!tool.heaters.ToObject<List<int>>().Contains(currentHeater.Index)) continue;

                        //This finds the position of the heater index in the heater configuration section,
                        //so if tool 0 has is configured to use to use heater 1 as it's only heater, then 
                        //then 1, specifying the heater index, will be in the 0 position. That position, 0, 
                        //will correspond to the position of the active temp for that heater in the active 
                        //temps section.
                        var toolHeaterIndex = tool.heaters.ToObject<List<int>>().IndexOf(currentHeater.Index);
                        temperatures.Add(currentHeater.Index, new TemperatureStatus
                        {
                            HeaterIndex = currentHeater.Index,
                            Actual = currentTemps[currentHeater.Index],
                            Target = temps.tools.active.ToObject<List<List<float>>>()[toolIndex][toolHeaterIndex]
                        });
                    }
                }
            }

            return temperatures;
        }

        int? _fanIndex;
        protected float ReadFanSpeed(dynamic jobStatus, dynamic machineStatus)
        {
            var parameters = jobStatus["params"];
            if (parameters == null) return 0;
            if (parameters["fanPercent"] == null) return 0;

            if (!_fanIndex.HasValue)
            {
                var tools = machineStatus.tools;
                var currentToolIndex = (int)jobStatus.currentTool;
                var currentTool = tools[currentToolIndex];

                if (currentTool == null) return 0;
                if (currentTool["fans"] == null) return 0;

                var currentToolFanMask = (int)currentTool.fans;
                var controllableFans = (int)machineStatus.controllableFans;
                var fanPercentCount = parameters.fanPercent.Count;
                for (var fanIndex = 0; fanIndex < Math.Min(controllableFans, fanPercentCount); fanIndex++)
                {
                    if ((currentToolFanMask & (1 << fanIndex)) != 0)
                    {
                        _fanIndex = fanIndex;
                        break;
                    }
                }
            }

            return parameters.fanPercent[_fanIndex];
        }

        /// <summary>
        /// This attempts to replicate what's being done by Duet Web Control to calculate the current progress. 
        /// </summary>
        protected async Task<(int timeRemaining, float progress)> CalculateCompletion(dynamic jobStatus, CancellationToken cancellationToken)
        {
            try
            {
                dynamic fileInfo = await Fetch("rr_fileinfo", cancellation: cancellationToken);
                if (fileInfo != null && fileInfo.err == 0)
                {
                    if (fileInfo.filament.Count > 0)
                    {
                        //determine progress based on the amount of filament used compared to how much is required
                        var filament = (IEnumerable<float>)fileInfo.filament.ToObject<IEnumerable<float>>();
                        var rawFilament = (IEnumerable<float>)jobStatus.extrRaw.ToObject<IEnumerable<float>>();
                        var totalFilament = filament.Aggregate((product, next) => product + next);
                        var totalRawFilament = rawFilament.Aggregate((product, next) => product + next);
                        var progress = totalRawFilament / totalFilament * 100;

                        return (jobStatus.timesLeft.filament, Math.Max(0, (float)Math.Round(progress, 1)));
                    }

                    if (fileInfo.height > 0)
                    {
                        //determine the progress based on the current height compared to the total print height
                        var progress = (float)jobStatus.coords.xyz[2] / (float)fileInfo.height * 100;
                        return (jobStatus.timesLeft.layer, Math.Max(0, (float)Math.Round(progress)));
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error("Calculate Progress Failure", ex);
            }

            //there was an issue with the file info, just use the fraction printed. 
            return (jobStatus.timesLeft.file, jobStatus.fractionPrinted);
        }
    }
}