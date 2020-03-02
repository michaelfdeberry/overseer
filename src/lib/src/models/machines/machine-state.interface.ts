import { MachineStateType } from './machine-state.enum';

export interface MachineState {
    machineId: number;
    type: MachineStateType;
    temperatures?: { [key: number]: { actual: number, target: number } };
    elapsedTime?: number;
    estimatedRemainingTime?: number;
    progress?: number;
    fanSpeed?: number;
    feedRate?: number;
    flowRates?: { [key: number]: number };
}
