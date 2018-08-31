import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";

import { Observable } from "rxjs";

import { CertificateErrorDialogComponent } from "./certificate-error-dialog.component";
import { ConfigurationService } from "../../shared/configuration.service";

@Injectable()
export class CertificateErrorService {
    constructor(private dialog: MatDialog, private configurationService: ConfigurationService) {}

    handleCertificateException(ex): Observable<boolean> {
        return new Observable<boolean>(o => {
            function pushResult(result: boolean) {
                o.next(result);
                o.complete();
                o.unsubscribe();
            }

            if (!ex || !ex.error || ex.error !== "certificate_exception") {
                return pushResult(false);
            }

            this.dialog.open(CertificateErrorDialogComponent, {
                 panelClass: "certificate-error",
                 data: ex.properties
            })
                .afterClosed().subscribe(result => {
                    if (result) {
                        this.configurationService.addCertificateException(ex.properties)
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
