import { Machine } from 'overseer_lib';
import { Observable } from 'redux';

export abstract class MachinesService {
  abstract readonly supportsAdvanceSettings: boolean;

  abstract getMachines(): Observable<Machine[]>;

  abstract getMachine(machineId: number): Observable<Machine>;

  abstract createMachine(machine: Machine): Observable<Machine>;

  abstract updateMachine(machine: Machine): Observable<Machine>;

  abstract deleteMachine(machine: Machine): Observable<Machine>;

  abstract sortMachines(sortOrder: number[]): Observable<void>;
}
