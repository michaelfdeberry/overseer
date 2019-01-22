import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export abstract class ControlService {
    abstract pauseJob(machineId: number): Observable<Object>;

    abstract resumeJob(machineId: number): Observable<Object>;

    abstract cancelJob(machineId: number): Observable<Object>;

    abstract setFanSpeed(machineId: number, speedPercentage: number): Observable<Object>;

    abstract setFeedRate(machineId: number, speedPercentage: number): Observable<Object>;

    abstract setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<Object>;

    abstract setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<Object>;
}
