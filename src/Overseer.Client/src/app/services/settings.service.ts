import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationInfo } from '../models/application-info.model';
import { CertificateDetails } from '../models/certificate-details.model';
import { Machine } from '../models/machine.model';
import { ApplicationSettings } from '../models/settings.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export abstract class SettingsService {
  abstract getConfigurationBundle(): Observable<{
    machines: Machine[];
    users: User[];
    settings: ApplicationSettings;
  }>;

  abstract getSettings(): Observable<ApplicationSettings>;

  abstract updateSettings(settings: ApplicationSettings): Observable<ApplicationSettings>;

  abstract addCertificateException(certificateDetails: CertificateDetails): Observable<CertificateDetails>;

  abstract getApplicationInfo(): Observable<ApplicationInfo>;
}
