import { MachineStatus, idleStates, MachineState } from "../models/machine-status.model";
import { Machine, MachineType, MachineTool, MachineToolType, WebCamOrientation } from "../models/machine.model";
import { ApplicationSettings } from "../models/settings.model";

export class MachineMonitor implements Machine {
    id: number;
    name: string;
    disabled: boolean;
    machineType: MachineType;
    tools: MachineTool[];
    url: string;
    webCamUrl: string;
    webCamOrientation: WebCamOrientation;
    snapshotUrl: string;
    apiKey?: string;
    profile: string;
    availableProfiles: Map<string, string>;
    sortIndex: number;

    get machineTypeName() {
        return MachineType[this.machineType];
    }

    private statusBacking: MachineStatus;

    constructor(machine: Machine, private settings: ApplicationSettings) {
        Object.assign(this, machine);
    }

    get isVisible() {
        if (!this.settings) { return false; }

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

    get webCamOrientationName() {
        return WebCamOrientation[this.webCamOrientation];
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
