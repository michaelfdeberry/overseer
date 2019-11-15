import { Injectable } from "@angular/core";
import { PromptDialogOptions, PromptDialogComponent } from "./prompt-dialog.component";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { AlertDialogOptions, AlertDialogComponent } from "./alert-dialog.component";

@Injectable()
export class DialogService {
    constructor(private dialog: MatDialog) {}

    alert(options: AlertDialogOptions): MatDialogRef<AlertDialogComponent> {
        return this.dialog.open(AlertDialogComponent, {
            panelClass: "alert",
            hasBackdrop: false,
            data: options
        });
    }

    prompt(options: PromptDialogOptions): MatDialogRef<PromptDialogComponent> {
        return this.dialog.open(PromptDialogComponent, {
            panelClass: "prompt",
            hasBackdrop: false,
            data: options
        });
    }
}
