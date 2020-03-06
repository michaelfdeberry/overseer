import { Certificate, SystemSettings } from 'overseer_lib';
import { Observable } from 'rxjs';

export abstract class SettingsService {
  abstract getSettings(): Observable<SystemSettings>;

  abstract updateSettings(settings: SystemSettings): Observable<SystemSettings>;

  abstract addCertificateException(certificateDetails: Certificate): Observable<void>;

  abstract getApplicationInfo(): Observable<{ [key: string]: string}>;

  abstract getLog(): Observable<string>;
}
