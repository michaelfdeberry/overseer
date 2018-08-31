import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { endpointFactory } from "./endpoint-factory.function";
import { CertificateDetails } from "../configuration/configuration-printers/certificate-error-dialog.component";

@Injectable()
export class ConfigurationService {
    private getEndpoint = endpointFactory("/api/config");

    constructor(private http: HttpClient) { }

    /*
     * TODO: add caching support
     **/

    getPrinters() {
        return this.http.get<any>(this.getEndpoint("printers"));
    }

    getPrinter(printerId: number) {
        return this.http.get<any>(this.getEndpoint("printers", printerId));
    }

    createPrinter(printer: any) {
        return this.http.put<any>(this.getEndpoint("printers"), printer);
    }

    updatePrinter(printer: any) {
        return this.http.post(this.getEndpoint("printers"), printer);
    }

    deletePrinter(printer: any) {
        return this.http.delete(this.getEndpoint("printers", printer.id));
    }

    getSettingsBundle() {
        return this.http.get<any>(this.getEndpoint("settings", "bundle"));
    }

    getSettings() {
        return this.http.get<any>(this.getEndpoint("settings"));
    }

    updateSettings(settings: any) {
        return this.http.post<any>(this.getEndpoint("settings"), settings);
    }

    getUsers() {
        return this.http.get<any>(this.getEndpoint("users"));
    }

    getUser(userId: number) {
        return this.http.get<any>(this.getEndpoint("users", userId));
    }

    createUser(user: any) {
        return this.http.put<any>(this.getEndpoint("users"), user);
    }

    updateUser(user: any) {
        return this.http.post<any>(this.getEndpoint("users"), user);
    }

    deleteUser(user: any) {
        return this.http.delete(this.getEndpoint("users", user.id));
    }

    addCertificateException(certificateDetails: CertificateDetails) {
        return this.http.put(this.getEndpoint("certificate"), certificateDetails);
    }

    getApplicationInfo() {
        return this.http.get(this.getEndpoint("about"));
    }
}
