import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mergeMap, NEVER, Observable } from 'rxjs';
import { Machine, MachineType } from '../models/machine.model';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export class MachinesService {
  private getEndpoint = endpointFactory('/api/machines');
  private http = inject(HttpClient);

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.getEndpoint());
  }

  getMachine(machineId: number): Observable<Machine> {
    return this.http.get<Machine>(this.getEndpoint(machineId));
  }

  createMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.getEndpoint(), machine);
  }

  updateMachine(machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(this.getEndpoint(), machine);
  }

  deleteMachine(machine: Machine): Observable<Machine> {
    return this.http.delete<Machine>(this.getEndpoint(machine.id));
  }

  sortMachines(sortOrder: number[]): Observable<never> {
    return this.http.post(this.getEndpoint('sort'), sortOrder).pipe(mergeMap(() => NEVER));
  }

  getMachineTypes(): Observable<MachineType[]> {
    return this.http.get<MachineType[]>(this.getEndpoint('types'));
  }
}
