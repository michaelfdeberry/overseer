import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export class ControlService {
  private getEndpoint = endpointFactory('/api/control');

  constructor(private http: HttpClient) {}

  pauseJob(machineId: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, 'pause'), null);
  }

  resumeJob(machineId: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, 'resume'), null);
  }

  cancelJob(machineId: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, 'cancel'), null);
  }

  setFanSpeed(machineId: number, speedPercentage: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, 'fan', speedPercentage), null);
  }

  setFeedRate(machineId: number, speedPercentage: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, 'feed', speedPercentage), null);
  }

  setTemperature(machineId: number, heaterIndex: number, temperature: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, heaterIndex, 'temp', temperature), null);
  }

  setFlowRate(machineId: number, extruderIndex: number, flowRatePercentage: number): Observable<void> {
    return this.http.post<void>(this.getEndpoint(machineId, extruderIndex, 'flow', flowRatePercentage), null);
  }
}
