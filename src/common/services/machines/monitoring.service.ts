import { EventEmitter } from 'events';

import { DataContext } from '../../data/data-context.interface';
import { Machine } from '../../models';
import { SystemSettings } from '../../models/system/settings.interface';
import { MachineProviderService } from './provider.service';

export class MonitoringService {
  private intervalRef: any;
  machineStateEventEmitter: EventEmitter = new EventEmitter();

  constructor(private context: DataContext, private providerService: MachineProviderService) {}

  enable(): void {
    if (this.intervalRef) return;
    this.monitor();
  }

  disable(): void {
    if (!this.intervalRef) return;
    clearInterval(this.intervalRef);
    this.intervalRef = undefined;
  }

  private async pollMachines(context: DataContext): Promise<void> {
    const machines: Machine[] = await context.machines.getAll();
    machines
      .filter(machine => !machine.disabled)
      .forEach(machine => {
        this.providerService
          .getProvider(machine)
          .getMachineState()
          .then(state => this.machineStateEventEmitter.emit('MachineState', state));
      });
  }

  private monitor(): void {
    this.context.values.get<SystemSettings>('SystemSettings').then(settings => {
      this.intervalRef = setInterval(() => this.pollMachines(this.context), settings.interval);
    });

    this.pollMachines(this.context);
  }
}
