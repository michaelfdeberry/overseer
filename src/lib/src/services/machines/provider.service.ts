import { Machine, machineConfigurationBuilder } from '../../models/machines';
import { MachineProvider } from '../../models/machines/machine.provider';

export class MachineProviderService {
    private static providerCache: Map<number, MachineProvider> = new Map();

    createProvider(machineType: string): MachineProvider {
        const builder = machineConfigurationBuilder.get(machineType);
        return new builder.provider();
    }

    getProvider(machine: Machine): MachineProvider {
        if (!MachineProviderService.providerCache.has(machine.id)) {
            MachineProviderService.providerCache.set(machine.id, this.createProvider(machine.type));
        }

        return MachineProviderService.providerCache.get(machine.id);
    }
}
