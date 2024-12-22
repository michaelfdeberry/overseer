import { Injectable } from '@angular/core';
import { forkJoin, merge, Observable, ReplaySubject, Subject, Subscription, timer } from 'rxjs';
import { MachineStatus } from '../../models/machine-status.model';
import { MachinesService } from '../machines.service';
import { MonitoringService } from '../monitoring.service';
import { SettingsService } from '../settings.service';
import { MachineProviderService } from './providers/machine-provider.service';
import { defaultPollInterval } from '../../models/constants';

@Injectable({
  providedIn: 'root',
})
export class LocalMonitoringService implements MonitoringService {
  private statusEvent$ = new ReplaySubject<MachineStatus>(10, defaultPollInterval, { now: () => Date.now() });
  private timerSubscription?: Subscription;

  constructor(
    private settingsService: SettingsService,
    private machineService: MachinesService,
    private machineProviders: MachineProviderService
  ) {}

  enableMonitoring(): Observable<MachineStatus> {
    if (!this.timerSubscription) {
      this.settingsService.getSettings().subscribe((settings) => {
        this.timerSubscription = timer(0, settings.interval ?? defaultPollInterval).subscribe(() => this.fetchStatus());
      });
    }

    return this.statusEvent$;
  }

  disableMonitoring(): void {
    if (!this.timerSubscription) return;

    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
  }

  private fetchStatus(): void {
    this.machineService.getMachines().subscribe((machines) => {
      const providers = this.machineProviders.getProviders(machines);
      merge(...providers.map((provider) => provider.getStatus())).subscribe((status) => {
        this.statusEvent$.next(status);
      });
    });
  }
}
