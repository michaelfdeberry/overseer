import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { ControlService } from '../services/control.service';
import { DialogService } from '../dialogs/dialog.service';
import { MachineMonitor } from './machine-monitor';
import { TuneDialogService } from './tune-dialog.service';
import { MachineState } from '../models/machine-status.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoring-machine',
  templateUrl: 'machine-monitor.component.html',
  styleUrls: ['machine-monitor.component.scss'],
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, CommonModule],
})
export class MachineMonitorComponent {
  @Input() machine!: MachineMonitor;

  height?: number;
  width?: number;
  status: any;
  zoomState = false;
  dimensionsSubscription?: Subscription;

  constructor(
    private controlService: ControlService,
    private dialog: DialogService,
    private tuneDialogService: TuneDialogService,
  ) {}

  get progressMode() {
    if (this.machine.currentState === MachineState.Connecting) {
      return 'indeterminate';
    }

    return 'determinate';
  }

  toggleZoom() {
    this.zoomState = !this.zoomState;
  }

  tune() {
    this.tuneDialogService.open(this.machine);
  }

  pause() {
    this.controlService.pauseJob(this.machine.id).subscribe();
  }

  resume() {
    this.controlService.resumeJob(this.machine.id).subscribe();
  }

  cancel() {
    this.dialog
      .prompt({
        titleKey: 'cancelJobTitle',
        messageKey: 'cancelJobMessage',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.controlService.cancelJob(this.machine.id).subscribe();
        }
      });
  }
}
