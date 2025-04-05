import { Injectable } from '@angular/core';
import { forkJoin, Observable, ReplaySubject, Subscription } from 'rxjs';
import { MachineStatus } from '../../models/machine-status.model';
import { MachinesService } from '../machines.service';
import { MonitoringService } from '../monitoring.service';
import { SettingsService } from '../settings.service';
import { MachineProviderService } from './providers/machine-provider.service';

@Injectable({
  providedIn: 'root',
})
export class LocalMonitoringService implements MonitoringService {
  private machineSubscriptions: Record<number, Subscription> = {};
  private status$?: ReplaySubject<MachineStatus>;

  constructor(
    private settingsService: SettingsService,
    private machineService: MachinesService,
    private machineProviders: MachineProviderService
  ) {}

  enableMonitoring(): Observable<MachineStatus> {
    if (!this.status$) {
      this.status$ = new ReplaySubject<MachineStatus>(10);
      forkJoin([this.settingsService.getSettings(), this.machineService.getMachines()]).subscribe(([settings, machines]) => {
        this.machineProviders.getProviders(machines).forEach((p) => {
          if (this.machineSubscriptions[p.machine.id]) {
            return;
          }

          const subscription = p.listen$(settings).subscribe((s) => {
            console.log('Update from', p.machine.name, s);
            this.status$?.next(s);
          });
          this.machineSubscriptions[p.machine.id] = subscription;
        });
      });
    }

    return this.status$;
  }

  disableMonitoring(): void {
    Object.values(this.machineSubscriptions || {}).forEach((s) => s.unsubscribe());
    this.machineSubscriptions = {};
    this.status$?.complete();
    this.status$ = undefined;
  }
}
