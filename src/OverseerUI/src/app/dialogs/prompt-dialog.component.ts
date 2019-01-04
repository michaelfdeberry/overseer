import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

export interface PromptDialogOptions {
    titleKey?: string;
    messageKey?: string;
    negativeActionTextKey?: string;
    positiveActionTextKey?: string;
}

@Component({
    selector: "app-prompt",
    templateUrl: "./prompt-dialog.component.html"
})
export class PromptDialogComponent {
    options: PromptDialogOptions;

    constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PromptDialogOptions
    ) {
        this.options = Object.assign({
            titleKey: "warning",
            messageKey: "areYourSure",
            negativeActionTextKey: "no",
            positiveActionTextKey: "yes"
        }, data);
    }
}
