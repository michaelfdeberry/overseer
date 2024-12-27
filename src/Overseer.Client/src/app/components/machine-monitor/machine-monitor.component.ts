import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, ElementRef, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';
import { filter, Observable } from 'rxjs';
import { isIdle, MachineStatus } from '../../models/machine-status.model';
import { Machine } from '../../models/machine.model';
import { DurationPipe } from '../../pipes/duration.pipe';
import { AuthenticationService } from '../../services/authentication.service';
import { ControlService } from '../../services/control.service';
import { DialogService } from '../../services/dialog.service';
import { MonitoringService } from '../../services/monitoring.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-machine-monitor',
  templateUrl: './machine-monitor.component.html',
  styleUrls: ['./machine-monitor.component.scss'],
  imports: [CommonModule, I18NextModule, DurationPipe, NgbProgressbarModule, RouterLink],
  providers: [DialogService],
  standalone: true,
})
export class MachineMonitorComponent {
  private host = inject(ElementRef);
  private destroy = inject(DestroyRef);
  private dialogService = inject(DialogService);
  private controlService = inject(ControlService);
  private monitoringService = inject(MonitoringService);
  private authenticationService = inject(AuthenticationService);

  machine = input<Machine>();
  busy = signal(false);
  fullScreen = signal(false);
  expanded = signal<boolean>(false);
  status = signal<MachineStatus | undefined>(undefined);
  idle = computed(() => isIdle(this.status()?.state));
  paused = computed(() => this.status()?.state === 'Paused');
  operational = computed(() => this.status()?.state === 'Operational');
  heaters = computed(() => this.machine()?.tools.filter((tool) => tool.toolType === 'Heater'));
  extruders = computed(() => this.machine()?.tools.filter((tool) => tool.toolType === 'Extruder'));
  isAdmin = computed(() => this.authenticationService.activeUser()?.accessLevel === 'Administrator');

  constructor() {
    effect(() => {
      const machine = this.machine();
      if (!machine) return;

      untracked(() => {
        this.monitoringService
          .enableMonitoring()
          .pipe(takeUntilDestroyed(this.destroy))
          .subscribe((status: MachineStatus) => {
            if (status.machineId !== machine.id) return;
            this.status.set(status);
          });
      });
    });

    effect(() => {
      const isFullscreen = this.fullScreen();
      if (isFullscreen && !document.fullscreenElement) {
        this.host.nativeElement.requestFullscreen();
      } else if (!!document.fullscreenElement) {
        document.exitFullscreen();
      }
    });
  }

  pause(): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.pauseJob(machine.id));
  }

  resume(): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.resumeJob(machine.id));
  }

  cancel(): void {
    const machine = this.machine();
    if (!machine) return;

    this.dialogService
      .prompt({
        titleKey: 'cancelJobTitle',
        messageKey: 'cancelJobMessage',
      })
      .closed.pipe(filter((confirmed) => confirmed))
      .subscribe(() => this.disableUi(this.controlService.cancelJob(machine.id)));
  }

  increaseTemp(heaterIndex: number): void {
    const machine = this.machine();
    const status = this.status();
    if (!machine) return;
    if (!status?.temperatures) return;

    this.setTemp(heaterIndex, (status.temperatures[heaterIndex].target += 1));
  }

  decreaseTemp(heaterIndex: number): void {
    const machine = this.machine();
    const status = this.status();
    if (!machine) return;
    if (!status?.temperatures) return;

    this.setTemp(heaterIndex, (status.temperatures[heaterIndex].target -= 1));
  }

  setTemp(heaterIndex: number, temperature: number): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.setTemperature(machine.id, heaterIndex, temperature));
  }

  setFeedRate(feedRate: number): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.setFeedRate(machine.id, feedRate));
  }

  setFlowRate(extruderIndex: number, flowRate: number): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.setFlowRate(machine.id, extruderIndex, flowRate));
  }

  setFanSpeed(fanSpeed: number): void {
    const machine = this.machine();
    if (!machine) return;

    this.disableUi(this.controlService.setFanSpeed(machine.id, fanSpeed));
  }

  private disableUi(observable: Observable<void>): void {
    this.busy.set(true);
    observable.subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }
}
