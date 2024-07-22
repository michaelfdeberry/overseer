import { Injectable } from '@angular/core';
import { forkJoin, merge, Observable, Subject, Subscription, timer } from 'rxjs';
import { MachineStatus } from '../../models/machine-status.model';
import { MachinesService } from '../machines.service';
import { MonitoringService } from '../monitoring.service';
import { SettingsService } from '../settings.service';
import { MachineProviderService } from './providers/machine-provider.service';

@Injectable({
  providedIn: 'root',
})
export class LocalMonitoringService implements MonitoringService {
  public readonly statusEvent$ = new Subject<MachineStatus>();

  private timer?: Observable<number>;
  private timerSubscription?: Subscription;

  constructor(
    private settingsService: SettingsService,
    private machineService: MachinesService,
    private machineProviders: MachineProviderService
  ) {}

  enableMonitoring(): void {
    if (this.timer) {
      return;
    }

    forkJoin([this.settingsService.getSettings(), this.machineService.getMachines()]).subscribe(([settings, machines]) => {
      this.timer = timer(0, settings.interval ?? 10000);

      this.timerSubscription = this.timer.subscribe(() => {
        const providers = this.machineProviders.getProviders(machines);
        merge(...providers.map((provider) => provider.getStatus())).subscribe((status) => {
          this.statusEvent$.next(status);
        });
      });
    });
  }

  disableMonitoring(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.timer = undefined;
  }
}
