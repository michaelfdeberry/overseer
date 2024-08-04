import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { I18NextModule } from 'angular-i18next';
import { Observable } from 'rxjs';
import { DialogService } from '../dialogs/dialog.service';
import { MachineStatus } from '../models/machine-status.model';
import { ControlService } from '../services/control.service';
import { DurationPipe } from '../shared/duration.pipe';
import { LetDirective } from '../shared/let.directive';
import { MachineMonitor } from './machine-monitor';

@Component({
  selector: 'app-monitoring-tune',
  templateUrl: './tune-dialog.component.html',
  styleUrls: ['./tune-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIcon, MatSlider, MatSliderThumb, MatProgressBar, MatDialogClose, DurationPipe, FormsModule, I18NextModule, LetDirective],
})
export class TuneDialogComponent {
  disabled = false;

  constructor(
    public dialogRef: MatDialogRef<TuneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MachineMonitor,
    private controlService: ControlService,
    private dialog: DialogService
  ) {}

  get status(): MachineStatus {
    return this.data.status!;
  }

  pause() {
    this.disableUi(this.controlService.pauseJob(this.data.id));
  }

  resume() {
    this.disableUi(this.controlService.resumeJob(this.data.id));
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
          this.disableUi(this.controlService.cancelJob(this.data.id));
          this.dialogRef.close();
        }
      });
  }

  increaseTemp(heaterIndex: number) {
    if (!this.status?.temperatures) return;
    this.disableUi(this.controlService.setTemperature(this.data.id, heaterIndex, (this.status.temperatures[heaterIndex].target += 1)));
  }

  decreaseTemp(heaterIndex: number) {
    if (!this.status?.temperatures) return;
    this.disableUi(this.controlService.setTemperature(this.data.id, heaterIndex, (this.status.temperatures[heaterIndex].target -= 1)));
  }

  setFeedRate(feedRate: number) {
    this.disableUi(this.controlService.setFeedRate(this.data.id, feedRate));
  }

  setFlowRate(extruderIndex: number, flowRate: number) {
    this.disableUi(this.controlService.setFlowRate(this.data.id, extruderIndex, flowRate));
  }

  setFanSpeed(fanSpeed: number) {
    this.disableUi(this.controlService.setFanSpeed(this.data.id, fanSpeed));
  }

  private disableUi(observable: Observable<void>) {
    this.disabled = true;
    const enableUi = () => (this.disabled = false);
    observable.subscribe({
      next: enableUi,
      error: enableUi,
    });
  }
}
