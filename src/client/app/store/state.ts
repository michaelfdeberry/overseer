import { DisplayUser, Machine, MachineState, SystemSettings } from '@overseer/common/models';

export type Notification = {
  message?: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
};

export interface AppState {
  isInitialized: boolean;
  isSetup?: boolean;
  isLocalApp?: boolean;
  isLoading?: boolean;
  currentTheme?: string;
  lastNotification?: Notification;
  activeUser: DisplayUser;
  users?: DisplayUser[];
  settings?: SystemSettings;
  machines?: Machine[];
  machineStates?: { [key: string]: MachineState };
}
