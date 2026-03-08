using Overseer.Server.Integration.Machines;

namespace Overseer.Server.Machines;

public class ControlManager(IMachineManager machineManager, MachineProviderManager machineProviderManager) : IControlManager
{
  public Task Pause(int machineId)
  {
    return Execute(machineId, provider => provider.PauseJob());
  }

  public Task Resume(int machineId)
  {
    return Execute(machineId, provider => provider.ResumeJob());
  }

  public Task Cancel(int machineId)
  {
    return Execute(machineId, provider => provider.CancelJob());
  }

  private async Task Execute(int machineId, Func<IMachineProvider, Task> action)
  {
    var provider = machineProviderManager.GetProvider(machineManager.GetMachine(machineId));
    if (provider != null)
    {
      await action(provider);
    }
  }
}
