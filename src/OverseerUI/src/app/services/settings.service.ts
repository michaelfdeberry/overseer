import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApplicationSettings } from "../models/settings.model";

@Injectable({ providedIn: "root" })
export abstract class SettingsService {
    abstract getConfigurationBundle(): Observable<any>;

    abstract getSettings(): Observable<ApplicationSettings>;

    abstract updateSettings(settings: ApplicationSettings): Observable<ApplicationSettings>;

    abstract addCertificateException(certificateDetails: any): Observable<any>;

    abstract getApplicationInfo(): Observable<any>;
}
