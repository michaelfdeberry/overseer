using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Overseer.Data;
using Overseer.Machines;
using Overseer.Models;

namespace Overseer
{
  public class MachineManager : IMachineManager
  {
    readonly IRepository<Machine> _machines;
    readonly MachineProviderManager _machineProviderManager;

    public MachineManager(IDataContext context, MachineProviderManager machineProviderManager)
    {
      _machines = context.GetRepository<Machine>();
      _machineProviderManager = machineProviderManager;
    }

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
      await LoadConfiguration(machine);

      //The new machine will be added to the end of the list
      machine.SortIndex = _machines.Count() + 1;

      //if the configuration is updated with data from the machine then store the configuration.
      _machines.Create(machine);

      return machine;
    }

    public async Task<Machine> UpdateMachine(Machine machine)
    {
      if (!machine.Disabled)
      {
        //update the configuration from the machine if the machine isn't disabled
        await LoadConfiguration(machine);
      }

      _machines.Update(machine);
      return machine;
    }

    public Machine DeleteMachine(int machineId)
    {
      var machine = GetMachine(machineId);
      if (machine == null) return null;

      _machines.Delete(machineId);
      return machine;
    }

    public void SortMachines(List<int> sortOrder)
    {
      var machines = _machines.GetAll().ToList();
      machines.ForEach(m => m.SortIndex = sortOrder.IndexOf(m.Id));

      _machines.Update(machines);
    }

    Task LoadConfiguration(Machine machine)
    {
      return _machineProviderManager.GetProvider(machine).LoadConfiguration(machine);
    }

    public IEnumerable<string> GetMachineTypes()
    {
      return [.. Enum.GetNames(typeof(MachineType)).Where(x => x != MachineType.Unknown.ToString()).OrderBy(x => x)];
    }
  }
}
