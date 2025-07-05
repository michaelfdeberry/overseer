using Overseer.Server.Models;

namespace Overseer.Server.Machines;

public class ControlManager(IMachineManager machineManager, MachineProviderManager machineProviderManager) : IControlManager
{
  public Task Pause(int machineId)
  {
    return machineProviderManager.GetProvider(machineManager.GetMachine(machineId)).PauseJob();
  }

  public Task Resume(int machineId)
  {
    return machineProviderManager.GetProvider(machineManager.GetMachine(machineId)).ResumeJob();
  }

  public Task Cancel(int machineId)
  {
    return machineProviderManager.GetProvider(machineManager.GetMachine(machineId)).CancelJob();
  }

  public Task SetTemperature(int machineId, int heaterIndex, int temperature)
  {
    var machine = machineManager.GetMachine(machineId);
    var provider = machineProviderManager.GetProvider(machine);
    var tool = machine.Tools.First(x => x.ToolType == MachineToolType.Heater && x.Index == heaterIndex);

    if (tool.Name?.Equals("bed", StringComparison.CurrentCultureIgnoreCase) == true)
    {
      return provider.SetBedTemperature(temperature);
    }
    else
    {
      return provider.SetToolTemperature(heaterIndex, temperature);
    }
  }
}
