import { Observable } from 'rxjs';

export abstract class ControlService {
  abstract pauseJob(machineId: number): Observable<void>;

  abstract resumeJob(machineId: number): Observable<void>;

  abstract cancelJob(machineId: number): Observable<void>;

  abstract setFanSpeed(machineId: number, speedPercentage: number): Observable<void>;

  abstract setFeedRate(machineId: number, speedPercentage: number): Observable<void>;

  abstract setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<void>;

  abstract setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<void>;
}
