export enum MachineState {
    Disabled = -2,
    Connecting = -1,
    Offline,
    Idle,
    Paused,
    Operational
}

export const idleStates = [
    MachineState.Disabled,
    MachineState.Connecting,
    MachineState.Offline,
    MachineState.Idle,
];

export interface TemperatureStatus {
    heaterIndex: number;
    actual: number;
    target: number;
}

export interface MachineStatus {
    machineId: number;
    state: MachineState;
    temperatures?: { [key: number]: TemperatureStatus };
    elapsedJobTime?: number;
    estimatedTimeRemaining?: number;
    progress?: number;
    fanSpeed?: number;
    feedRate?: number;
    flowRates?: { [key: number]: number };
}
