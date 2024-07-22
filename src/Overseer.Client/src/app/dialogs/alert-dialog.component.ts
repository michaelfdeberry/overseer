import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { I18NextModule } from 'angular-i18next';

export interface AlertDialogOptions {
  titleKey?: string;
  messageKey?: string;
  actionTextKey?: string;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert-dialog.component.html',
  standalone: true,
  imports: [MatDialogClose, MatDialogTitle, I18NextModule],
})
export class AlertDialogComponent {
  options!: AlertDialogOptions;

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDialogOptions
  ) {
    this.options = Object.assign(
      {
        actionTextKey: 'dismiss',
      },
      data
    );
  }
}
