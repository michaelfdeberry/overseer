using Overseer.Machines;
using Overseer.Models;
using System.Linq;
using System.Threading.Tasks;

namespace Overseer
{
	public class ControlManager : IControlManager
	{
		readonly IMachineManager _machineManager;
        readonly MachineProviderManager _machineProviderManager; 

        public ControlManager(IMachineManager machineManager, MachineProviderManager machineProviderManager)
        {
			_machineManager = machineManager;
            _machineProviderManager = machineProviderManager;
        }

        public Task Pause(int machineId)
        {
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).PauseJob();
        }

        public Task Resume(int machineId)
		{
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).ResumeJob();
        }

		public Task Cancel(int machineId)
		{
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).CancelJob();
        }

		public Task SetTemperature(int machineId, int heaterIndex, int temperature)
		{
			var machine = _machineManager.GetMachine(machineId);
			var provider = _machineProviderManager.GetProvider(machine);
			var tool = machine.Tools.First(x => x.ToolType == MachineToolType.Heater && x.Index == heaterIndex);			

			if (tool.Name.ToLower() == "bed")
			{
				return provider.SetBedTemperature(temperature);
			}
			else
			{
				return provider.SetToolTemperature(heaterIndex, temperature);
			}
        }

		public Task SetFeedRate(int machineId, int feedRate)
		{
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).SetFeedRate(feedRate);
        }

		public Task SetFlowRate(int machineId, int extruderIndex, int flowRate)
		{
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).SetFlowRate(extruderIndex, flowRate);
        }

		public Task SetFanSpeed(int machineId, int percentage)
		{
			return _machineProviderManager.GetProvider(_machineManager.GetMachine(machineId)).SetFanSpeed(percentage);
        }
    }
}