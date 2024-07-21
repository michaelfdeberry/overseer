import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApplicationSettings } from "../../models/settings.model";
import { SettingsService } from "../settings.service";
import { endpointFactory } from "./endpoint-factory";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class RemoteSettingsService implements SettingsService {
    private getSettingsEndpoint = endpointFactory("/api/settings");
    private getLoggingEndpoint = endpointFactory("/api/logging");

    constructor(private http: HttpClient) {}

    getConfigurationBundle() {
        return this.http.get<any>(this.getSettingsEndpoint("bundle"));
    }

    getSettings() {
        return this.http.get<ApplicationSettings>(this.getSettingsEndpoint());
    }

    updateSettings(settings: ApplicationSettings) {
        return this.http.post<ApplicationSettings>(this.getSettingsEndpoint(), settings);
    }

    addCertificateException(certificateDetails: any) {
        return this.http.put(this.getSettingsEndpoint("certificate"), certificateDetails);
    }

    getApplicationInfo() {
        return this.http.get(this.getSettingsEndpoint("about"));
    }

    getLog(): Observable<string> {
        // I am sure not what, but sometimes the log contains text that will break observable
        // if the content of the file is returned directly. Putting it in an object and then
        // piping in a map to get the string seems to work fine.
        return this.http.get<{ content: string }>(this.getLoggingEndpoint()).pipe(map(x => x.content));
    }
}
