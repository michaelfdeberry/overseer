import { DataContext } from '../../data/data-context.class';
import { MachineToolType } from '../../models/machines';
import { MachineProvider } from '../../models/machines/machine.provider';
import { MachineProviderService } from './provider.service';

export class MachineControlService {
  constructor(private context: DataContext, private providerService: MachineProviderService) {}

  async getProvider(machineId: number): Promise<MachineProvider> {
    const machine = await this.context.machines.getById(machineId);
    return this.providerService.getProvider(machine);
  }

  async pauseJob(machineId: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.pauseJob();
  }

  async resumeJob(machineId: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.resumeJob();
  }

  async cancelJob(machineId: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.cancelJob();
  }

  async setFanSpeed(machineId: number, speedPercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFanSpeed(speedPercentage);
  }

  async setFeedRate(machineId: number, speedPercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFeedRate(speedPercentage);
  }

  async setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFlowRate(extruderIndex, flowRatePercentage);
  }

  async setTemperature(machineId: number, heaterIndex: number, temperature: number): Promise<void> {
    const machine = await this.context.machines.getById(machineId);
    const provider = this.providerService.getProvider(machine);

    if (machine.tools.find(tool => tool.type === MachineToolType.Heater && tool.index === heaterIndex && tool.name === 'bed')) {
      return provider.setBedTemperature(temperature);
    }

    return provider.setToolTemperature(heaterIndex, temperature);
  }
}
