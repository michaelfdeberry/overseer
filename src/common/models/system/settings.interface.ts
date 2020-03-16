export const defaultInterval = 10000;
export const defaultLocalPort = 9000;

export const defaultSystemSettings: SystemSettings = {
  interval: defaultInterval,
  localPort: defaultLocalPort,
  sortByTimeRemaining: false,
  hideIdleMachines: false,
  hideDisabledMachines: false,
};

export interface SystemSettings {
  interval: number;
  localPort: number;
  sortByTimeRemaining: boolean;
  hideIdleMachines: boolean;
  hideDisabledMachines: boolean;
}
