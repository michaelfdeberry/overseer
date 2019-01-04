import { Injectable } from "@angular/core";
import { Machine } from "../../../models/machine.model";
import { machineStoreName, openDatabase } from "./open-database-function";

@Injectable({ providedIn: "root" })
export class MachineStorageService {

    async createMachine(machine: Machine) {
        const db = await openDatabase();
        return db.add(machineStoreName, machine);
    }

    async getMachines(): Promise<Machine[]> {
        const db = await openDatabase();
        return db.getAll(machineStoreName);
    }

    async getMachineById(machineId: number): Promise<Machine> {
        const db = await openDatabase();
        return db.getByKey(machineStoreName, machineId);
    }

    async updateMachine(machine: Machine) {
        const db = await openDatabase();
        return db.update(machineStoreName, machine);
    }

    async deleteMachine(machineId: number) {
        const db = await openDatabase();
        return db.delete(machineStoreName, machineId);
    }

}
