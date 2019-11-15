import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface AlertDialogOptions {
    titleKey?: string;
    messageKey?: string;
    actionTextKey?: string;
}

@Component({
    selector: "app-alert",
    templateUrl: "./alert-dialog.component.html"
})
export class AlertDialogComponent {
    options: AlertDialogOptions;

    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AlertDialogOptions
    ) {
        this.options = Object.assign({
            actionTextKey: "dismiss"
        }, data);
    }
}
