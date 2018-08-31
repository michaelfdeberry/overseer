import { Injectable } from "@angular/core";
import { endpointFactory } from "./endpoint-factory.function";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ControlService {
    private getEndpoint = endpointFactory("/api/control");

    constructor(private http: HttpClient) {}

    pausePrint(printerId: number) {
        return this.http.get(this.getEndpoint(printerId, "pause"));
    }

    resumePrint(printerId: number) {
        return this.http.get(this.getEndpoint(printerId, "resume"));
    }

    cancelPrint(printerId: number) {
        return this.http.get(this.getEndpoint(printerId, "cancel"));
    }

    setFanSpeed(printerId: number, speedPercentage: number) {
        return this.http.get(this.getEndpoint(printerId, "fan", speedPercentage));
    }

    setFeedRate(printerId: number, speedPercentage: number) {
        return this.http.get(this.getEndpoint(printerId, "feed", speedPercentage));
    }

    setTemperature(printerId: number, toolName: string, temperature: number) {
        return this.http.get(this.getEndpoint(printerId, toolName, "temp", temperature));
    }

    setFlowRate(printerId: number, toolName: string, flowRatePercentage: number) {
        return this.http.get(this.getEndpoint(printerId, toolName, "flow", flowRatePercentage ));
    }
}
