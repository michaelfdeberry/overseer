import { MachineStatus, idleStates, MachineState } from "../models/machine-status.model";
import { Machine, MachineType, MachineTool, MachineToolType } from "../models/machine.model";

export interface StreamDimensions {
    width: number;
    height: number;
}

export class MachineMonitor implements Machine {
    id: number;
    name: string;
    disabled: boolean;
    machineType: MachineType;
    tools: MachineTool[];
    url: string;
    webCamUrl: string;
    snapshotUrl: string;
    apiKey?: string;
    profile: string;
    availableProfiles: Map<string, string>;

    get machineTypeName() {
        return MachineType[this.machineType];
    }

    private statusBacking: MachineStatus;

    constructor(machine: any, private settings: any) {
        Object.assign(this, machine);
    }

    get isVisible() {
        if (this.settings.hideDisabledMachines && this.disabled) {
            return false;
        }

        if (this.settings.hideIdleMachines && idleStates.indexOf(this.currentState) >= 0) {
            return false;
        }

        return true;
    }

    get currentState(): MachineState {
        if (this.disabled) { return MachineState.Disabled; }

        return this.status ? this.status.state : MachineState.Connecting;
    }

    get currentStateName() {
        return MachineState[this.currentState];
    }

    get status(): MachineStatus {
        return this.statusBacking;
    }

    set status(value: MachineStatus) {
        if (value && value.machineId === this.id) {
            this.statusBacking = value;
        }
    }

    get heaters(): any[] {
        if (!this.tools) { return null; }

        return this.tools.filter(tool => tool.toolType === MachineToolType.Heater);
    }

    get extruders(): any[] {
        if (!this.tools) { return null; }

        return this.tools.filter(tool => tool.toolType === MachineToolType.Extruder);
    }
}
