import { EventEmitter } from 'events';

import { DataContext } from '../../data/data-context.class';
import { SystemSettings } from '../../models/system/settings.interface';
import { MachineProviderService } from './provider.service';

export class MonitoringService {
  private intervalRef: any;
  machineStateUpdateEvent: EventEmitter = new EventEmitter();

  constructor(private context: DataContext, private providerService: MachineProviderService) {}

  enable() {
    if (this.intervalRef) return;
    this.monitor();
  }

  disable() {
    if (!this.intervalRef) return;
    clearInterval(this.intervalRef);
    this.intervalRef = undefined;
  }

  private async pollMachines(context: DataContext) {
    const machines = await context.machines.getAll();
    machines
      .filter(machine => !machine.disabled)
      .forEach(machine => {
        this.providerService
          .getProvider(machine)
          .getMachineState()
          .then(state => this.machineStateUpdateEvent.emit('MachineState', state));
      });
  }

  private monitor() {
    this.context.values.get<SystemSettings>('SystemSettings').then(settings => {
      this.intervalRef = setInterval(() => this.pollMachines(this.context), settings.interval);
    });

    this.pollMachines(this.context);
  }
}
