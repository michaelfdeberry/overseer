export type MachineState = 'Disabled' | 'Connecting' | 'Offline' | 'Idle' | 'Paused' | 'Operational';

export const idleStates: MachineState[] = ['Disabled', 'Connecting', 'Offline', 'Idle'];

export function isIdle(state: MachineState) {
  return idleStates.includes(state);
}

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
