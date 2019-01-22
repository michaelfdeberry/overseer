import { Machine } from "../models/machine.model";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export abstract class MachinesService {
    abstract readonly supportsAdvanceSettings: boolean;

    abstract getMachines(): Observable<Machine[]>;

    abstract getMachine(machineId: number): Observable<Machine>;

    abstract createMachine(machine: Machine): Observable<Machine>;

    abstract updateMachine(machine: Machine): Observable<Machine>;

    abstract deleteMachine(machine: Machine): Observable<Machine>;
}
