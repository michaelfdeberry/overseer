import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Machine, MachineType } from '../models/machine.model';

@Injectable({ providedIn: 'root' })
export abstract class MachinesService {
  abstract readonly supportsAdvanceSettings: boolean;

  abstract getMachines(): Observable<Machine[]>;

  abstract getMachine(machineId: number): Observable<Machine>;

  abstract createMachine(machine: Machine): Observable<Machine>;

  abstract updateMachine(machine: Machine): Observable<Machine>;

  abstract deleteMachine(machine: Machine): Observable<Machine>;

  abstract sortMachines(sortOrder: number[]): Observable<never>;

  abstract getMachineTypes(): Observable<MachineType[]>;
}
