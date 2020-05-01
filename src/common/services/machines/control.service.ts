import { DataContext } from '../../data/data-context.class';
import { MachineToolType } from '../../models/machines';
import { MachineProvider } from '../../models/machines/machine.provider';
import { MachineProviderService } from './provider.service';

export class MachineControlService {
  constructor(private context: DataContext, private providerService: MachineProviderService) {}

  private async getProvider(machineId: string): Promise<MachineProvider> {
    const machine = await this.context.machines.getById(machineId);
    return this.providerService.getProvider(machine);
  }

  async pauseJob(machineId: string): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.pauseJob();
  }

  async resumeJob(machineId: string): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.resumeJob();
  }

  async cancelJob(machineId: string): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.cancelJob();
  }

  async setFanSpeed(machineId: string, speedPercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFanSpeed(speedPercentage);
  }

  async setFeedRate(machineId: string, speedPercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFeedRate(speedPercentage);
  }

  async setFlowRate(machineId: string, extruderIndex: number, flowRatePercentage: number): Promise<void> {
    const provider = await this.getProvider(machineId);
    return await provider.setFlowRate(extruderIndex, flowRatePercentage);
  }

  async setTemperature(machineId: string, heaterIndex: number, temperature: number): Promise<void> {
    const machine = await this.context.machines.getById(machineId);
    const provider = this.providerService.getProvider(machine);

    if (machine.tools.find(tool => tool.type === MachineToolType.Heater && tool.index === heaterIndex && tool.name === 'bed')) {
      return provider.setBedTemperature(temperature);
    }

    return provider.setToolTemperature(heaterIndex, temperature);
  }
}
