import { Injectable } from "@angular/core";
import { Machine } from "../../../models/machine.model";
import { NgxIndexedDBService } from "ngx-indexed-db";

@Injectable({ providedIn: "root" })
export class MachineStorageService {
    constructor(private db: NgxIndexedDBService) {}

    executeDbRequest<T>(action: () => T): T {
        this.db.currentStore = "machines";
        return action();
    }

    async createMachine(machine: Machine) {
        machine.id = await this.executeDbRequest(() => this.db.add(machine));
        return machine;
    }

    async getMachines(): Promise<Machine[]> {
        return await this.executeDbRequest(() => this.db.getAll());
    }

    async getMachineById(machineId: number): Promise<Machine> {
        return await this.executeDbRequest(() => this.db.getByID(machineId));
    }

    async updateMachine(machine: Machine) {
        return await this.executeDbRequest(() => this.db.update(machine, machine.id));
    }

    async deleteMachine(machineId: number) {
        return await this.executeDbRequest(() => this.db.deleteRecord(machineId));
    }

    async updateMachines(machines: Machine[]) {
        const self = this;
        return await this.executeDbRequest(() => {
            const promises: Promise<any>[] = [];
            machines.forEach(machine => promises.push(self.db.update(machine, machine.id)));
            return Promise.all(promises);
        });
    }
}
