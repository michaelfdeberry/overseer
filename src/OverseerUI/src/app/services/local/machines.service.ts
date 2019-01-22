import { Injectable } from "@angular/core";

import { defer, Observable } from "rxjs";

import { Machine } from "../../models/machine.model";
import { MachinesService } from "../machines.service";
import { MachineProviderService } from "./providers/machine-provider.service";
import { MachineStorageService } from "./storage/machine-storage.service";
import { catchError } from "rxjs/operators";
import { ErrorHandlerService } from "../error-handler.service";

@Injectable({ providedIn: "root" })
export class LocalMachinesService implements MachinesService {
    supportsAdvanceSettings = false;

    constructor(
        private machineStorage: MachineStorageService,
        private machineProviders: MachineProviderService,
        private errorHandler: ErrorHandlerService
    ) {}

    getMachines(): Observable<Machine[]> {
        return defer(() => this.machineStorage.getMachines());
    }

    getMachine(machineId: number): Observable<Machine> {
        return defer(() => this.machineStorage.getMachineById(machineId));
    }

    createMachine(machine: Machine): Observable<Machine> {
        const self = this;
        const provider = this.machineProviders.getProvider(machine);
        return defer(async function() {
            await provider.loadConfiguration(machine).toPromise();
            await self.machineStorage.createMachine(machine);
            return machine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    updateMachine(machine: Machine): Observable<Machine> {
        const self = this;
        return defer(async function() {
            const pMachine = await self.machineStorage.getMachineById(machine.id);
            Object.assign(pMachine, machine);

            if (!pMachine.disabled) {
                const provider = self.machineProviders.getProvider(pMachine);
                await provider.loadConfiguration(pMachine);
            }

            await self.machineStorage.updateMachine(pMachine);
            return pMachine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    deleteMachine(machine: Machine): Observable<Machine> {
        const self = this;
        return defer(async function() {
            await self.machineStorage.deleteMachine(machine.id);
            return machine;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }
}
