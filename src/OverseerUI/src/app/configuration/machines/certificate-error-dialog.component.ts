import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

export interface CertificateDetails {
    issuedTo: string;
    issuedBy: string;
    issueDate: string;
    expireDate: string;
    thumbprint: string;
}

@Component({
    selector: "app-certificate-error-dialog",
    templateUrl: "./certificate-error-dialog.component.html",
    styleUrls: [
        "../configuration.scss",
        "./certificate-error-dialog.component.scss"
    ]
})
export class CertificateErrorDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<CertificateErrorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CertificateDetails
    ) {}
}
