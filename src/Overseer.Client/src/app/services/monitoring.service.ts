import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MachineStatus } from '../models/machine-status.model';

@Injectable({
  providedIn: 'root',
})
export abstract class MonitoringService {
  abstract enableMonitoring(): Observable<MachineStatus>;
  abstract disableMonitoring(): void;
}
