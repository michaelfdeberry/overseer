import { Injectable } from "@angular/core";
import { endpointFactory } from "./endpoint-factory";
import { HttpClient } from "@angular/common/http";
import { ControlService } from "../control.service";

@Injectable({ providedIn: "root" })
export class RemoteControlService implements ControlService {
    private getEndpoint = endpointFactory("/api/control");

    constructor(private http: HttpClient) {}

    pauseJob(machineId: number) {
        return this.http.get(this.getEndpoint(machineId, "pause"));
    }

    resumeJob(machineId: number) {
        return this.http.get(this.getEndpoint(machineId, "resume"));
    }

    cancelJob(machineId: number) {
        return this.http.get(this.getEndpoint(machineId, "cancel"));
    }

    setFanSpeed(machineId: number, speedPercentage: number) {
        return this.http.get(this.getEndpoint(machineId, "fan", speedPercentage));
    }

    setFeedRate(machineId: number, speedPercentage: number) {
        return this.http.get(this.getEndpoint(machineId, "feed", speedPercentage));
    }

    setTemperature(machineId: number, heaterIndex: number, temperature: number) {
        return this.http.get(this.getEndpoint(machineId, heaterIndex, "temp", temperature));
    }

    setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number) {
        return this.http.get(this.getEndpoint(machineId, extruderIndex, "flow", flowRatePercentage ));
    }
}
