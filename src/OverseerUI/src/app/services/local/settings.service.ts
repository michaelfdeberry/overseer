import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-store";
import { Observable, of } from "rxjs";
import { UAParser } from "ua-parser-js";
import { environment } from "../../../environments/environment";
import { Machine } from "../../models/machine.model";
import { ApplicationSettings } from "../../models/settings.model";
import { PersistedUser, toUser } from "../../models/user.model";
import { SettingsService } from "../settings.service";

@Injectable({ providedIn: "root" })
export class LocalSettingsService implements SettingsService {
    constructor(private localStorage: LocalStorageService) {}

    createAppSettings(): ApplicationSettings {
        const settings: ApplicationSettings = {
            hideDisabledMachines: false,
            hideIdleMachines: false,
            interval: 10000
        };

        this.localStorage.set("settings", settings);
        return settings;
    }

    getConfigurationBundle(): Observable<any> {
        const users: PersistedUser[] = this.localStorage.get("users") || [];
        const machines: Machine[] = this.localStorage.get("machines") || [];
        const settings: ApplicationSettings = this.localStorage.get("settings") || this.createAppSettings;

        return of<any>({
            users: users.map(u => toUser(u)),
            settings: settings,
            machines: machines
        });
    }

    getSettings(): Observable<ApplicationSettings> {
        return of(this.localStorage.get("settings") || this.createAppSettings());
    }

    updateSettings(settings: ApplicationSettings): Observable<ApplicationSettings> {
        this.localStorage.set("settings", settings);
        return of(settings);
    }

    addCertificateException(certificateDetails: any): Observable<any> {
        // This isn't supported for the client side app as it isn't needed.
        // as long as the browser can open the page the app will be able to access
        // the api.
        return of(null);
    }

    getApplicationInfo(): Observable<any> {
        const parser = new UAParser();

        return of({
            platform: parser.getEngine().name,
            operatingSystem: parser.getOS().name,
            machineName: parser.getBrowser().name,
            version: environment.appVersion
        });
    }
}
