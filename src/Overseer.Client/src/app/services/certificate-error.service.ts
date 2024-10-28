import { inject, Injectable } from '@angular/core';
import { iif, map, Observable, of, switchMap } from 'rxjs';
import { CertificateWarningComponent } from '../components/certificate-warning/certificate-warning.component';
import { Certificate } from '../models/certificate';
import { DialogService } from './dialog.service';
import { SettingsService } from './settings.service';
import { environment } from '../../environments/environment';

@Injectable()
export class CertificateErrorService {
  private settingsService = inject(SettingsService);
  private dialogService = inject(DialogService);

  handleCertificateException(ex: { key: string; properties: Certificate }): Observable<boolean> {
    if (environment.serviceType === 'local') return of(false);

    if (!ex || !ex.key || ex.key !== 'certificate_exception') {
      return of(false);
    }

    return this.dialogService
      .show(CertificateWarningComponent, { data: ex.properties })
      .closed.pipe(
        switchMap((result) => iif(() => result, this.settingsService.addCertificateException(ex.properties).pipe(map(() => true)), of(false)))
      );
  }
}
