import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { endpointFactory } from "./endpoint-factory";
import { SettingsService } from "../settings.service";
import { ApplicationSettings } from "../../models/settings.model";

@Injectable({ providedIn: "root" })
export class RemoteSettingsService implements SettingsService {
    private getEndpoint = endpointFactory("/api/settings");

    constructor(private http: HttpClient) {}

    getConfigurationBundle() {
        return this.http.get<any>(this.getEndpoint("bundle"));
    }

    getSettings() {
        return this.http.get<ApplicationSettings>(this.getEndpoint());
    }

    updateSettings(settings: ApplicationSettings) {
        return this.http.post<ApplicationSettings>(this.getEndpoint(), settings);
    }

    addCertificateException(certificateDetails: any) {
        return this.http.put(this.getEndpoint("certificate"), certificateDetails);
    }

    getApplicationInfo() {
        return this.http.get(this.getEndpoint("about"));
    }
}
