import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class ControlService {
  abstract pauseJob(machineId: number): Observable<void>;

  abstract resumeJob(machineId: number): Observable<void>;

  abstract cancelJob(machineId: number): Observable<void>;

  abstract setFanSpeed(machineId: number, speedPercentage: number): Observable<void>;

  abstract setFeedRate(machineId: number, speedPercentage: number): Observable<void>;

  abstract setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<void>;

  abstract setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<void>;
}
