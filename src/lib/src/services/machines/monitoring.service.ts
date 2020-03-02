import { EventEmitter } from 'events';

import { DataContext } from '../../data/data-context.class';
import { SystemSettings } from '../../models/system/settings.interface';
import { MachineProviderService } from './provider.service';

export class MonitoringService {
    private intervalRef: any;
    machineStateUpdateEvent: EventEmitter;

    constructor(private context: DataContext, private providerService: MachineProviderService) {}

    enable() {
        if (this.intervalRef) return;
        this.monitor();
    }

    disable() {
        if (!this.intervalRef) return;
        clearInterval(this.intervalRef);
    }

    private monitor() {
        this.context.values.get<SystemSettings>('SystemSettings').then((settings) => {
            this.intervalRef = setInterval(async () => {
                const machines = await this.context.machines.getAll();

                machines
                    .filter((machine) => !machine.disabled)
                    .forEach((machine) => {
                        this.providerService
                            .getProvider(machine)
                            .getMachineState()
                            .then((state) => this.machineStateUpdateEvent.emit('MachineState', state));
                    });
            }, settings.interval);
        });
    }
}
