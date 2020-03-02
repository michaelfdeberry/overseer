import { SystemSettings } from 'overseer_lib';
import { Observable } from 'rxjs';

export abstract class SettingsService {
    abstract getConfigurationBundle(): Observable<any>;

    abstract getSettings(): Observable<SystemSettings>;

    abstract updateSettings(settings: SystemSettings): Observable<SystemSettings>;

    abstract addCertificateException(certificateDetails: any): Observable<any>;

    abstract getApplicationInfo(): Observable<any>;

    abstract getLog(): Observable<string>;
}
