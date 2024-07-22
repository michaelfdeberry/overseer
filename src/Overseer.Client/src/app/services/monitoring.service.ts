import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MachineStatus } from '../models/machine-status.model';

@Injectable({
  providedIn: 'root',
})
export abstract class MonitoringService {
  readonly statusEvent$!: Subject<MachineStatus>;

  abstract enableMonitoring(): void;

  abstract disableMonitoring(): void;
}
