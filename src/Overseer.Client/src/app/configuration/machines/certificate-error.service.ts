import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { Observable } from "rxjs";

import { CertificateErrorDialogComponent } from "./certificate-error-dialog.component";
import { SettingsService } from "../../services/settings.service";

@Injectable()
export class CertificateErrorService {
    constructor(private dialog: MatDialog, private settingsService: SettingsService ) {}

    handleCertificateException(ex): Observable<boolean> {
        return new Observable<boolean>(o => {
            function pushResult(result: boolean) {
                o.next(result);
                o.complete();
                o.unsubscribe();
            }

            if (!ex || !ex.key || ex.key !== "certificate_exception") {
                return pushResult(false);
            }

            this.dialog.open(CertificateErrorDialogComponent, {
                panelClass: "certificate-error",
                data: ex.properties
            })
                .afterClosed().subscribe(result => {
                    if (result) {
                        this.settingsService.addCertificateException(ex.properties)
                            .subscribe(
                                () => pushResult(true),
                                err => o.error(err)
                            );
                    } else {
                        pushResult(false);
                    }
                });
        });
    }
}
