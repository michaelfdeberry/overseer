import { Machine, machineConfigurationBuilder } from '../../models/machines';
import { MachineProvider } from '../../models/machines/machine.provider';

export class MachineProviderService {
  private static providerCache: Map<string, MachineProvider> = new Map();

  createProvider(machineType: string): MachineProvider {
    const builder = machineConfigurationBuilder.get(machineType);
    return new builder.provider();
  }

  getProvider(machine: Machine): MachineProvider {
    if (!MachineProviderService.providerCache.has(machine.id)) {
      const provider = this.createProvider(machine.type);
      provider.machine = machine;

      MachineProviderService.providerCache.set(machine.id, provider);
    }

    return MachineProviderService.providerCache.get(machine.id);
  }
}
