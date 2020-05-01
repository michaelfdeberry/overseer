import axios from 'axios';
import { Observable, Observer } from 'rxjs';

function issueControlCommand(endpoint: string): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    axios
      .get(endpoint)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function pauseJob(machineId: string): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/pause`);
}

export function resumeJob(machineId: string): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/resume`);
}

export function cancelJob(machineId: string): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/cancel`);
}

export function setFanSpeed(machineId: string, speedPercentage: number): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/fan/${speedPercentage}`);
}

export function setFeedRate(machineId: string, speedPercentage: number): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/feed/${speedPercentage}`);
}

export function setTemperature(machineId: string, heaterIndex: number, temperature: number): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/heater/${heaterIndex}/temp/${temperature}`);
}

export function setFlowRate(machineId: string, extruderIndex: number, flowRatePercentage: number): Observable<void> {
  return issueControlCommand(`/api/control/${machineId}/extruder/${extruderIndex}/flow/${flowRatePercentage}`);
}
