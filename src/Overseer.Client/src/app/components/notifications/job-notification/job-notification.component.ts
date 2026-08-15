import { NgClass } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { I18NextPipe } from 'angular-i18next';
import { filter } from 'rxjs';
import { MachineStatus } from '../../../models/machine-status.model';
import { JobNotification } from '../../../models/notifications.model';
import { RelativeDatePipe } from '../../../pipes/relative-date.pipe';
import { ControlService } from '../../../services/control.service';
import { DialogService } from '../../../services/dialog.service';
import { MachinesService } from '../../../services/machines.service';
import { MonitoringService } from '../../../services/monitoring.service';
import { NotificationBaseComponent } from '../notification-base.component';

@Component({
  selector: 'app-job-notification',
  templateUrl: './job-notification.component.html',
  imports: [I18NextPipe, RelativeDatePipe, NgClass],
  providers: [DialogService],
})
export class JobNotificationComponent extends NotificationBaseComponent {
  private machinesService = inject(MachinesService);
  private controlService = inject(ControlService);
  private dialogService = inject(DialogService);
  private monitoringService = inject(MonitoringService);
  private destroyRef = inject(DestroyRef);

  protected machineStatus = signal<MachineStatus | undefined>(undefined);
  protected jobNotification = computed(() => this.notification() as JobNotification);

  protected machine = computed(() => {
    if (this.machinesService.machines.error()) return undefined;
    if (this.machinesService.machines.isLoading()) return undefined;
    if (!this.machinesService.machines.hasValue()) return undefined;

    const machineId = this.jobNotification()?.machineId;
    return this.machinesService.machines.value().find((m) => m.id === machineId);
  });

  protected isPaused = computed(() => this.machineStatus()?.state === 'Paused');

  constructor() {
    super();

    const setup = effect(() => {
      const machine = this.machine();
      if (!machine) return;

      this.monitoringService
        .monitorMachine(machine.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((status) => this.machineStatus.set(status));
      setup.destroy();
    });
  }

  protected handleDismiss() {
    this.notificationService.removeNotification(this.notification().id).subscribe();
  }

  protected pause(): void {
    this.controlService.pauseJob(this.jobNotification().machineId).subscribe();
    this.close.emit();
  }

  protected resume(): void {
    this.controlService.resumeJob(this.jobNotification().machineId).subscribe();
    this.close.emit();
  }

  protected cancel(): void {
    const machineId = this.jobNotification().machineId;

    this.dialogService
      .prompt({
        titleKey: 'cancelJobTitle',
        messageKey: 'cancelJobMessage',
      })
      .closed.pipe(filter((confirmed) => confirmed))
      .subscribe(() => {
        this.controlService.cancelJob(machineId).subscribe();
        this.close.emit();
      });
  }
}
