import { DataContext } from '../../data/data-context.interface';
import * as initializers from '../../integration';
import { MachineConfigurationBuilder, MachineConfigurationCollection } from '../../models/machines';
import { Machine } from '../../models/machines/machine.class';
import { MachineProvider } from '../../models/machines/machine.provider';

export class MachineConfigurationService {
  private providerCache: Map<string, MachineProvider> = new Map();
  private machineConfigurationBuilder: Map<string, MachineConfigurationBuilder> = new Map();

  constructor(private context: DataContext) {
    const factories: Array<() => [string, MachineConfigurationBuilder]> = Object.values(initializers);
    factories.forEach(func => {
      const [name, config] = func();
      this.machineConfigurationBuilder.set(name, config);
    });
  }

  getMachineTypes(): string[] {
    return Array.from(this.machineConfigurationBuilder.keys());
  }

  getMachineConfiguration(machineType: string): MachineConfigurationCollection | undefined {
    return this.machineConfigurationBuilder.get(machineType)?.configuration;
  }

  createProvider(machineType: string): MachineProvider {
    const builder = this.machineConfigurationBuilder.get(machineType);
    return new builder.provider();
  }

  getProvider(machine: Machine): MachineProvider {
    if (!this.providerCache.has(machine.id)) {
      const provider = this.createProvider(machine.type);
      provider.machine = machine;

      this.providerCache.set(machine.id, provider);
    }

    return this.providerCache.get(machine.id);
  }

  getMachine(id: string): Promise<Machine> {
    return this.context.machines.getById(id);
  }

  getMachines(): Promise<Machine[]> {
    return this.context.machines.getAll();
  }

  async createMachine(machineType: string, configuration: MachineConfigurationCollection): Promise<Machine> {
    const machines = await this.getMachines();
    const provider = this.createProvider(machineType);
    const machine = await provider.createMachine(configuration);

    machine.sortIndex = machines.length;
    await this.context.machines.add(machine);

    return machine;
  }

  async updateMachine(machine: Machine): Promise<Machine> {
    if (!machine.disabled) {
      const provider = this.getProvider(machine);
      Object.assign(machine, await provider.createMachine(machine.configuration));
    }

    await this.context.machines.update(machine);

    return machine;
  }

  async deleteMachine(machineId: string): Promise<void> {
    await this.context.machines.delete(machineId);
  }

  async sortMachines(sortOrder: string[]): Promise<Machine[]> {
    const machines = await this.getMachines();
    await this.context.machines.updateAll(
      machines.map(m => {
        m.sortIndex = sortOrder.indexOf(m.id);
        return m;
      })
    );

    return machines;
  }
}
