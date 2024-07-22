import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  AlertDialogComponent,
  AlertDialogOptions,
} from './alert-dialog.component';
import {
  PromptDialogComponent,
  PromptDialogOptions,
} from './prompt-dialog.component';

@Injectable()
export class DialogService {
  constructor(private dialog: MatDialog) {}

  alert(options: AlertDialogOptions): MatDialogRef<AlertDialogComponent> {
    return this.dialog.open(AlertDialogComponent, {
      panelClass: 'alert',
      hasBackdrop: false,
      data: options,
    });
  }

  prompt(options: PromptDialogOptions): MatDialogRef<PromptDialogComponent> {
    return this.dialog.open(PromptDialogComponent, {
      panelClass: 'prompt',
      hasBackdrop: false,
      data: options,
    });
  }
}
