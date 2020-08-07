import { EventEmitter } from 'events';

import { Machine } from '../../models';
import { SystemConfigurationService } from '../system/configuration.service';
import { MachineConfigurationService } from './configuration.service';

export class MonitoringService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private intervalRef: any;
  machineStateEventEmitter: EventEmitter = new EventEmitter();

  constructor(private machineConfigurationService: MachineConfigurationService, private systemConfigurationService: SystemConfigurationService) {}

  enable(): void {
    if (this.intervalRef) return;
    this.monitor();
  }

  disable(): void {
    if (!this.intervalRef) return;
    clearInterval(this.intervalRef);
    this.intervalRef = undefined;
  }

  private async pollMachines(): Promise<void> {
    const machines: Machine[] = await this.machineConfigurationService.getMachines();
    machines
      .filter(machine => !machine.disabled)
      .forEach(machine => {
        this.machineConfigurationService
          .getProvider(machine)
          .getMachineState()
          .then(state => this.machineStateEventEmitter.emit('MachineState', state));
      });
  }

  private monitor(): void {
    this.systemConfigurationService.getSystemSetting().then(settings => {
      this.intervalRef = setInterval(() => this.pollMachines(), settings.interval);
    });

    this.pollMachines();
  }
}
