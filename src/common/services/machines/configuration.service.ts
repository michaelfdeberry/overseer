import { DataContext } from '../../data/data-context.class';
import { MachineConfigurationCollection } from '../../models/machines';
import { Machine } from '../../models/machines/machine.class';
import { MachineProviderService } from './provider.service';

export class MachineConfigurationService {
  constructor(private context: DataContext, private providerService: MachineProviderService) {}

  getMachine(id: string): Promise<Machine> {
    return this.context.machines.getById(id);
  }

  getMachines(): Promise<Machine[]> {
    return this.context.machines.getAll();
  }

  async createMachine(machineType: string, configuration: MachineConfigurationCollection): Promise<Machine> {
    const provider = this.providerService.createProvider(machineType);
    const machine = await provider.createMachine(configuration);
    await this.context.machines.add(machine);

    return machine;
  }

  async updateMachine(machine: Machine): Promise<Machine> {
    if (!machine.disabled) {
      const provider = this.providerService.getProvider(machine);
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
