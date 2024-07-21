import { Injectable } from "@angular/core";

import { defer, Observable } from "rxjs";

import { Machine } from "../../models/machine.model";
import { MachinesService } from "../machines.service";
import { MachineProviderService } from "./providers/machine-provider.service";
import { catchError } from "rxjs/operators";
import { ErrorHandlerService } from "../error-handler.service";
import { RequireAdministrator } from "../../shared/require-admin.decorator";
import { IndexedStorageService } from "./indexed-storage.service";

@Injectable({ providedIn: "root" })
export class LocalMachinesService implements MachinesService {
    supportsAdvanceSettings = false;

    constructor(
        private storage: IndexedStorageService,
        private machineProviders: MachineProviderService,
        private errorHandler: ErrorHandlerService
    ) {}

    getMachines(): Observable<Machine[]> {
        return defer(() => this.storage.machines.getAll());
    }

    getMachine(machineId: number): Observable<Machine> {
        return defer(() => this.storage.machines.getByID(machineId));
    }

    @RequireAdministrator()
    createMachine(machine: Machine): Observable<Machine> {
        const self = this;
        const provider = this.machineProviders.getProvider(machine);
        return defer(async function() {
            await provider.loadConfiguration(machine).toPromise();
            await self.storage.machines.add(machine);
            return machine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    updateMachine(machine: Machine): Observable<Machine> {
        const self = this;
        return defer(async function() {
            const pMachine = await self.storage.machines.getByID(machine.id);
            Object.assign(pMachine, machine);

            if (!pMachine.disabled) {
                const provider = self.machineProviders.getProvider(pMachine);
                await provider.loadConfiguration(pMachine).toPromise();
            }

            await self.storage.machines.update(pMachine);

            return pMachine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    deleteMachine(machine: Machine): Observable<Machine> {
        const self = this;
        return defer(async function() {
            await self.storage.machines.deleteRecord(machine.id);
            return machine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    sortMachines(sortOrder: number[]): Observable<any> {
        const self = this;
        return defer(async function() {
            const machines = await self.storage.machines.getAll();

            await Promise.all(machines.map((machine) => {
                machine.sortIndex = sortOrder.indexOf(machine.id);
                return self.storage.machines.update(machine);
            }));
        });
    }
}
