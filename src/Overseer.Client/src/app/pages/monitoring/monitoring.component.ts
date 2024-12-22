import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { isIdle, MachineStatus } from '../../models/machine-status.model';
import { Machine } from '../../models/machine.model';
import { ApplicationSettings } from '../../models/settings.model';
import { DurationPipe } from '../../pipes/duration.pipe';
import { MachinesService } from '../../services/machines.service';
import { MonitoringService } from '../../services/monitoring.service';
import { SettingsService } from '../../services/settings.service';
import { MachineMonitorComponent } from '../../components/machine-monitor/machine-monitor.component';
import { I18NextModule } from 'angular-i18next';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  standalone: true,
  imports: [MachineMonitorComponent, I18NextModule, RouterLink],
})
export class MonitoringComponent {
  private destroyRef = inject(DestroyRef);
  private machineService = inject(MachinesService);
  private settingsService = inject(SettingsService);
  private monitoringService = inject(MonitoringService);

  loading = signal(true);
  machines = signal<Machine[] | undefined>(undefined);
  settings = signal<ApplicationSettings | undefined>(undefined);
  statuses = signal<Record<number, MachineStatus | undefined>>({});
  column = signal('');

  displayedMachines = computed(() => {
    const machines = this.machines();
    const settings = this.settings();
    const statuses = this.statuses();

    if (!machines) return;
    if (!settings) return;

    if (!settings.sortByTimeRemaining) {
      machines.sort((a, b) => a.sortIndex - b.sortIndex);
    } else {
      machines.sort((a, b) => {
        const defaultSort = a.sortIndex - b.sortIndex;
        const aStatus = statuses[a.id];
        const bStatus = statuses[b.id];

        if (!aStatus && !bStatus) return defaultSort;

        const checkUndefined = (left: unknown | undefined, right: unknown | undefined): number | undefined => {
          if (left === undefined && right === undefined) return defaultSort;
          if (left !== undefined && right === undefined) return -1;
          if (left === undefined && right !== undefined) return 1;
          return undefined;
        };

        // idle machines will get moved to the end of the list
        const idleCheck = checkUndefined(isIdle(aStatus?.state), isIdle(bStatus?.state));
        if (idleCheck !== undefined) return idleCheck;

        // it's possible the ETR won't be available initially, so it could be undefined here even if not idle.
        const remainingCheck = checkUndefined(aStatus?.estimatedTimeRemaining, bStatus?.estimatedTimeRemaining);
        if (remainingCheck !== undefined) return remainingCheck;

        // if it can get here they are both numbers
        return aStatus?.estimatedTimeRemaining! - bStatus?.estimatedTimeRemaining!;
      });
    }

    return machines.filter((machine) => this.isMachineVisible(machine, settings));
  });

  constructor() {
    const resizeObserver = new ResizeObserver(() => this.computeGridSize());
    resizeObserver.observe(document.body);

    forkJoin([this.machineService.getMachines(), this.settingsService.getSettings()]).subscribe(([machines, settings]) => {
      this.machines.set(machines);
      this.settings.set(settings);
      this.computeGridSize();
      // if the machines load too fast there is just an unpleasant flicker of the loading spinner
      setTimeout(() => this.loading.set(false), 250);
    });

    this.monitoringService.enableMonitoring().subscribe((status) => {
      this.statuses.update((statuses) => ({ ...statuses, [status.machineId]: status }));
    });

    this.destroyRef.onDestroy(() => {
      this.monitoringService.disableMonitoring();
      resizeObserver.disconnect();
    });
  }

  private isMachineVisible(machine: Machine, settings: ApplicationSettings): boolean {
    if (settings.hideIdleMachines && isIdle(this.statuses()[machine.id]?.state)) return false;
    if (settings.hideDisabledMachines && machine.disabled) return false;
    return true;
  }

  private computeGridSize(): void {
    const machines = this.displayedMachines();
    const count = machines?.length ?? 0;
    if (!count) return;

    if (document.body.clientWidth < 768) {
      this.column.set('col-12');
      // figure out what to do on mobile. maybe it scrolls horizontally? maybe swipe through the machines.
    } else {
      let base = document.body.clientWidth < 1024 ? 2 : 4;
      // if it's less than the base, just tile them
      // if (count <= base) {
      //   base /= 2;
      // }
      const factor = Math.ceil(count / (Math.floor(count / base) + (count % base > 0 ? 1 : 0)));
      console.log(factor);
      this.column.set(`col-${12 / factor}`);
    }
  }
}
