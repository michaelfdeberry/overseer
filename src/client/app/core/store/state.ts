import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';

export interface CoreState {
  isInitialized: boolean;
  isLocalApp?: boolean;
  requiresSetup?: boolean;
  activeUser?: DisplayUser;
  lastErrorMessage?: string;
  users?: DisplayUser[];
  machines?: Machine[];
  settings?: SystemSettings;
}

export const initialState: CoreState = {
  isInitialized: false,
};
