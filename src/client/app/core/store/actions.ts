import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';
import { Action } from 'redux';

import { TypedAction } from '../../store/action.type';

export enum CoreActionTypes {
  initialize = '@overseer/client/core/initialize',
  initializeComplete = '@overseer/client/core/initializeComplete',
  logError = '@overseer/client/core/handleError',
  displayError = '@overseer/client/core/displayError',
  clearLastError = '@overseer/client/core/clearLastError',
  fetchMachines = '@overseer/client/core/fetchMachines',
  updateMachine = '@overseer/client/core/updateMachine',
  machinesOperationComplete = '@overseer/client/core/machinesOperationComplete',
  fetchUsers = '@overseer/client/core/fetchUsers',
  updateUser = '@overseer/client/core/updateUser',
  usersOperationComplete = '@overseer/client/core/usersOperationComplete',
  fetchSettings = '@overseer/client/core/fetchSettings',
  updateSettings = '@overseer/client/core/updateSettings',
  settingsOperationComplete = '@overseer/client/core/settingsOperationComplete',
  signIn = '@overseer/client/core/signIn',
  signInComplete = '@overseer/client/core/signInComplete',
  signOut = '@overseer/client/core/signOut',
  invalidSession = '@overseer/client/core/invalidSession',
}

export type InitializeCompletePayload = {
  requiresSetup: boolean;
  isLocalApp: boolean;
  activeUser: DisplayUser;
};

export const coreActions = {
  initialize(): Action<string> {
    return { type: CoreActionTypes.initialize };
  },
  initializeComplete(payload: InitializeCompletePayload): TypedAction<InitializeCompletePayload> {
    return { type: CoreActionTypes.initializeComplete, ...payload };
  },
  logError(message: string, stack?: string): TypedAction<{ message: string; stack?: string }> {
    return { type: CoreActionTypes.logError, message, stack };
  },
  displayError(message: string): TypedAction<{ message: string }> {
    return { type: CoreActionTypes.displayError, message };
  },
  clearLastError(): Action<string> {
    return { type: CoreActionTypes.clearLastError };
  },
  fetchMachines(): Action<string> {
    return { type: CoreActionTypes.fetchMachines };
  },
  updateMachine(machine: Machine): TypedAction<{ machine: Machine }> {
    return { type: CoreActionTypes.updateMachine, machine };
  },
  machinesOperationComplete(machines: Machine[]): TypedAction<{ machines: Machine[] }> {
    return { type: CoreActionTypes.machinesOperationComplete, machines };
  },
  fetchUsers(): Action<string> {
    return { type: CoreActionTypes.fetchUsers };
  },
  updateUser(user: DisplayUser): TypedAction<{ user: DisplayUser }> {
    return { type: CoreActionTypes.updateUser, user };
  },
  usersOperationComplete(users: DisplayUser[]): TypedAction<{ users: DisplayUser[] }> {
    return { type: CoreActionTypes.usersOperationComplete, users };
  },
  fetchSettings(): Action<string> {
    return { type: CoreActionTypes.fetchSettings };
  },
  updateSettings(settings: SystemSettings): TypedAction<{ settings: SystemSettings }> {
    return { type: CoreActionTypes.updateSettings, settings };
  },
  settingsOperationComplete(settings: SystemSettings): TypedAction<{ settings: SystemSettings }> {
    return { type: CoreActionTypes.settingsOperationComplete, settings };
  },
  signIn(user: DisplayUser): TypedAction<{ user: DisplayUser }> {
    return { type: CoreActionTypes.signIn, user };
  },
  signInComplete(activeUser: DisplayUser): TypedAction<{ activeUser: DisplayUser }> {
    return { type: CoreActionTypes.signInComplete, activeUser };
  },
  signOut(user?: DisplayUser): TypedAction<{ user?: DisplayUser }> {
    return { type: CoreActionTypes.signOut, user };
  },
  invalidSession(): Action<string> {
    return { type: CoreActionTypes.invalidSession };
  },
};
