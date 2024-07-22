import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MachineMonitor } from './machine-monitor';
import { TuneDialogComponent } from './tune-dialog.component';

@Injectable()
export class TuneDialogService {
  constructor(private dialog: MatDialog) {}

  open(machine: MachineMonitor) {
    this.dialog.open(TuneDialogComponent, {
      panelClass: 'tune',
      data: machine,
    });
  }
}
