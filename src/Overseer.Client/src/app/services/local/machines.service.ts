import { Injectable } from '@angular/core';

import { defer, NEVER, Observable } from 'rxjs';

import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequireAdministrator } from '../../decorators/require-admin.decorator';
import { Machine } from '../../models/machine.model';
import { ErrorHandlerService } from '../error-handler.service';
import { MachinesService } from '../machines.service';
import { IndexedStorageService } from './indexed-storage.service';
import { MachineProviderService } from './providers/machine-provider.service';

@Injectable({ providedIn: 'root' })
export class LocalMachinesService implements MachinesService {
  supportsAdvanceSettings = false;

  constructor(private storage: IndexedStorageService, private machineProviders: MachineProviderService, private errorHandler: ErrorHandlerService) {}

  getMachines(): Observable<Machine[]> {
    return defer(() => this.storage.machines.getAll());
  }

  getMachine(machineId: number): Observable<Machine> {
    return defer(() => this.storage.machines.getByID(machineId));
  }

  @RequireAdministrator()
  createMachine(machine: Machine): Observable<Machine> {
    const provider = this.machineProviders.getProvider(machine);
    return provider.loadConfiguration(machine).pipe(
      mergeMap(() => {
        return this.storage.machines.add(machine).pipe(
          map(() => machine),
          catchError((err) => this.errorHandler.handle(err))
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  @RequireAdministrator()
  updateMachine(machine: Machine): Observable<Machine> {
    return this.storage.machines.getByID(machine.id!).pipe(
      mergeMap((pMachine) => {
        Object.assign(pMachine, machine);

        const updateAction = () => this.storage.machines.update(pMachine).pipe(catchError((err) => this.errorHandler.handle(err)));
        if (!pMachine.disabled) {
          const provider = this.machineProviders.getProvider(pMachine);
          return provider.loadConfiguration(pMachine).pipe(
            mergeMap(updateAction),
            catchError((err) => this.errorHandler.handle(err))
          );
        }
        return updateAction();
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  @RequireAdministrator()
  deleteMachine(machine: Machine): Observable<Machine> {
    return this.storage.machines.deleteRecord(machine.id).pipe(
      map(() => machine),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  @RequireAdministrator()
  sortMachines(sortOrder: number[]): Observable<never> {
    return this.storage.machines.getAll().pipe(
      mergeMap((machines) => {
        machines.forEach((machine) => {
          machine.sortIndex = sortOrder.indexOf(machine.id);
          this.storage.machines.update(machine);
        });
        return NEVER;
      })
    );
  }
}
