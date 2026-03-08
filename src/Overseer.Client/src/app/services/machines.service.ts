import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, mergeMap, NEVER, Observable, of, tap } from 'rxjs';
import { MachineMetadata } from '../models/machine-metadata.model';
import { Machine } from '../models/machine.model';
import { AuthenticationService } from './authentication.service';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export class MachinesService {
  private authenticationService = inject(AuthenticationService);
  private getEndpoint = endpointFactory('/api/machines');
  private http = inject(HttpClient);

  machines = rxResource({
    params: this.authenticationService.activeUser,
    stream: ({ params: activeUser }) => {
      if (!activeUser) {
        return of([]);
      }
      return this.getMachines().pipe(map((machines) => machines.map((m) => this.normalizeProperties(m))));
    },
  });

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.getEndpoint());
  }

  getMachine(machineId: number): Observable<Machine> {
    const cachedMachines = this.machines.value();

    if (cachedMachines !== undefined) {
      return of(cachedMachines.find((m) => m.id === machineId) as Machine);
    }

    return new Observable<Machine>((subscriber) => {
      const intervalId = setInterval(() => {
        const machines = this.machines.value();
        if (machines !== undefined) {
          clearInterval(intervalId);
          subscriber.next(machines.find((m) => m.id === machineId) as Machine);
          subscriber.complete();
        }
      }, 50);

      return () => clearInterval(intervalId);
    });
  }

  createMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.getEndpoint(), this.denormalizeProperties(machine)).pipe(tap(() => this.machines.reload()));
  }

  updateMachine(machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(this.getEndpoint(), this.denormalizeProperties(machine)).pipe(tap(() => this.machines.reload()));
  }

  deleteMachine(machine: Machine): Observable<Machine> {
    return this.http.delete<Machine>(this.getEndpoint(machine.id)).pipe(tap(() => this.machines.reload()));
  }

  sortMachines(sortOrder: number[]): Observable<never> {
    return this.http.post(this.getEndpoint('sort'), sortOrder).pipe(
      tap(() => this.machines.reload()),
      mergeMap(() => NEVER)
    );
  }

  enableMonitoring(machineId: number): Observable<Machine> {
    return this.http.post<Machine>(this.getEndpoint(machineId, 'monitoring'), {}).pipe(tap(() => this.machines.reload()));
  }

  disableMonitoring(machineId: number): Observable<Machine> {
    return this.http.delete<Machine>(this.getEndpoint(machineId, 'monitoring'), {}).pipe(tap(() => this.machines.reload()));
  }

  getMachineMetadata(): Observable<Record<string, MachineMetadata[]>> {
    const getPropertyName = (metadata: MachineMetadata): string => {
      return metadata.propertyName.charAt(0).toLowerCase() + metadata.propertyName.slice(1);
    };

    return this.http.get<Record<string, MachineMetadata[]>>(this.getEndpoint('metadata')).pipe(
      map((data) => {
        return Object.entries(data).reduce(
          (acc, [key, metadata]) => {
            acc[key] = metadata.map((m) => ({ ...m, propertyName: getPropertyName(m) }) as MachineMetadata);
            return acc;
          },
          {} as Record<string, MachineMetadata[]>
        );
      })
    );
  }

  private normalizeProperties(machine: Machine): Machine {
    if (!machine.properties) return machine;

    const normalized = Object.entries(machine.properties).reduce(
      (acc, [key, value]) => {
        const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
        acc[normalizedKey] = value;
        return acc;
      },
      {} as Record<string, unknown>
    );

    return { ...machine, properties: normalized };
  }

  private denormalizeProperties(machine: Machine): Machine {
    if (!machine.properties) return machine;

    const denormalized = Object.entries(machine.properties).reduce(
      (acc, [key, value]) => {
        const originalKey = key.charAt(0).toUpperCase() + key.slice(1);
        acc[originalKey] = value;
        return acc;
      },
      {} as Record<string, unknown>
    );

    return { ...machine, properties: denormalized };
  }
}
