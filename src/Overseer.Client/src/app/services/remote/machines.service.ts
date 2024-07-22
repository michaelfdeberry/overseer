import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { endpointFactory } from './endpoint-factory';
import { MachinesService } from '../machines.service';
import { mergeMap, NEVER, Observable } from 'rxjs';
import { Machine } from '../../models/machine.model';

@Injectable({ providedIn: 'root' })
export class RemoteMachinesService implements MachinesService {
  private getEndpoint = endpointFactory('/api/machines');

  supportsAdvanceSettings = true;

  constructor(private http: HttpClient) {}

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.getEndpoint());
  }

  getMachine(machineId: number) {
    return this.http.get<Machine>(this.getEndpoint(machineId));
  }

  createMachine(machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(this.getEndpoint(), machine);
  }

  updateMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.getEndpoint(), machine);
  }

  deleteMachine(machine: Machine): Observable<Machine> {
    return this.http.delete<Machine>(this.getEndpoint(machine.id));
  }

  sortMachines(sortOrder: number[]): Observable<never> {
    return this.http.post(this.getEndpoint('sort'), sortOrder).pipe(mergeMap(() => NEVER));
  }
}
