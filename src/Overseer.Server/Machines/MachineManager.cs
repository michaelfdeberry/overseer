﻿using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Machines
{
  public class MachineManager(IDataContext context, MachineProviderManager machineProviderManager, IRestartMonitoringChannel restartMonitoringChannel)
    : IMachineManager
  {
    readonly IRepository<Machine> _machines = context.Repository<Machine>();
    readonly MachineProviderManager _machineProviderManager = machineProviderManager;

    public Machine GetMachine(int id)
    {
      return _machines.GetById(id);
    }

    public IReadOnlyList<Machine> GetMachines()
    {
      var machines = _machines.GetAll();
      return machines;
    }

    public async Task<Machine> CreateMachine(Machine machine)
    {
      //load any default configuration that will be retrieved from the machine.
      await _machineProviderManager.CreateProvider(machine).LoadConfiguration(machine);

      //The new machine will be added to the end of the list
      machine.SortIndex = _machines.Count() + 1;

      //if the configuration is updated with data from the machine then store the configuration.
      _machines.Create(machine);
      await restartMonitoringChannel.Dispatch();

      return machine;
    }

    public async Task<Machine> UpdateMachine(Machine machine)
    {
      if (!machine.Disabled)
      {
        //update the configuration from the machine if the machine isn't disabled
        await _machineProviderManager.GetProvider(machine).LoadConfiguration(machine);
      }

      _machines.Update(machine);
      await restartMonitoringChannel.Dispatch();
      return machine;
    }

    public Machine? DeleteMachine(int machineId)
    {
      var machine = GetMachine(machineId);
      if (machine == null)
        return null;

      _machines.Delete(machineId);
      return machine;
    }

    public void SortMachines(List<int> sortOrder)
    {
      var machines = _machines.GetAll().ToList();
      machines.ForEach(m => m.SortIndex = sortOrder.IndexOf(m.Id));

      _machines.Update(machines);
    }

    public IEnumerable<string> GetMachineTypes()
    {
      return [.. Enum.GetNames(typeof(MachineType)).Where(x => x != MachineType.Unknown.ToString()).OrderBy(x => x)];
    }
  }
}
