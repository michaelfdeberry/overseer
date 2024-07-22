import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { CertificateDetails, CertificateErrorDialogComponent } from './certificate-error-dialog.component';

@Injectable()
export class CertificateErrorService {
  constructor(
    private dialog: MatDialog,
    private settingsService: SettingsService
  ) {}

  handleCertificateException(ex: { key: string; properties: CertificateDetails }): Observable<boolean> {
    return new Observable<boolean>((o) => {
      function pushResult(result: boolean) {
        o.next(result);
        o.complete();
        o.unsubscribe();
      }

      if (!ex || !ex.key || ex.key !== 'certificate_exception') {
        return pushResult(false);
      }

      this.dialog
        .open(CertificateErrorDialogComponent, {
          panelClass: 'certificate-error',
          data: ex.properties,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.settingsService.addCertificateException(ex.properties).subscribe({ complete: () => pushResult(true), error: (err) => o.error(err) });
          } else {
            pushResult(false);
          }
        });
    });
  }
}
