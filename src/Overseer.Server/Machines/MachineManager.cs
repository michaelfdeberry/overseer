using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Integration.Machines;
using Overseer.Server.Models;

namespace Overseer.Server.Machines;

public class MachineManager(IDataContext context, MachineProviderManager machineProviderManager, IRestartMonitoringChannel restartMonitoringChannel)
  : IMachineManager
{
  readonly IRepository<Machine> _machines = context.Repository<Machine>();
  readonly MachineProviderManager _machineProviderManager = machineProviderManager;

  public Machine GetMachine(int id)
  {
    return _machines.GetById(id);
  }

  public IReadOnlyList<Machine> GetMachines(bool maskSensitiveData = false)
  {
    var machines = _machines.GetAll().ToList();
    if (!maskSensitiveData)
      return machines;

    var allMetadata = _machineProviderManager.GetMachineMetadata();
    return
    [
      .. machines.Select(m =>
      {
        if (string.IsNullOrWhiteSpace(m.MachineType))
          return m;

        var machineMetadata = allMetadata[m.MachineType].ToDictionary(md => md.PropertyName, md => md);
        m.Properties = m.Properties.ToDictionary(
          p => p.Key,
          p =>
          {
            if (machineMetadata.TryGetValue(p.Key, out var metadata) && metadata.IsSensitive)
            {
              var value = p.Value?.ToString() ?? string.Empty;
              return new string('*', value.Length);
            }

            return p.Value;
          }
        );

        return m;
      }),
    ];
  }

  public async Task<Machine> CreateMachine(Machine machine)
  {
    //load any default configuration that will be retrieved from the machine.
    var configuredMachine = await _machineProviderManager.ConfigureMachine(machine);

    //The new machine will be added to the end of the list
    configuredMachine.SortIndex = _machines.Count() + 1;

    //if the configuration is updated with data from the machine then store the configuration.
    _machines.Create(configuredMachine);
    await restartMonitoringChannel.Dispatch();

    return configuredMachine;
  }

  public async Task<Machine> UpdateMachine(Machine machine)
  {
    var existingMachine = GetMachine(machine.Id) ?? throw new OverflowException($"Machine with id {machine.Id} not found.");

    var allMetadata = _machineProviderManager.GetMachineMetadata();
    var machineMetadata = allMetadata[existingMachine.MachineType!].ToDictionary(md => md.PropertyName, md => md);

    // if any of the sensitive properties contains *s then we should keep the existing value instead of updating it with the masked value
    machine.Properties = machine.Properties.ToDictionary(
      p => p.Key,
      p =>
      {
        if (machineMetadata.TryGetValue(p.Key, out var metadata) && metadata.IsSensitive && p.Value is string strValue && strValue.All(c => c == '*'))
        {
          return existingMachine.Properties[p.Key];
        }

        return p.Value;
      }
    );

    var configuredMachine = await _machineProviderManager.ConfigureMachine(machine);
    _machines.Update(configuredMachine);

    await restartMonitoringChannel.Dispatch();
    return configuredMachine;
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

  public IDictionary<string, IEnumerable<MachineMetadata>> GetMachineMetadata()
  {
    return _machineProviderManager.GetMachineMetadata();
  }

  public async Task EnableMonitoring(int machineId)
  {
    var machine = GetMachine(machineId);
    if (machine == null)
      return;

    machine.Disabled = false;
    _machines.Update(machine);
    await restartMonitoringChannel.Dispatch();
  }

  public async Task DisableMonitoring(int machineId)
  {
    var machine = GetMachine(machineId);
    if (machine == null)
      return;

    machine.Disabled = true;
    _machines.Update(machine);
    await restartMonitoringChannel.Dispatch();
  }
}
