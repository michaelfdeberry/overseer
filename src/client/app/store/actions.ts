import { DisplayUser, Machine, MachineState, SystemSettings } from '@overseer/common/models';

import { Action, TypedAction } from './action.type';
import { AppState, Notification } from './state';

const actionsTypes = {
  common: {
    initialize: '@overseer/common/initialize',
    setActiveUser: '@overseer/common/setActiveUser',
    clearActiveUser: '@overseer/common/clearActiveUser',
    updateSettings: '@overseer/common/updateSettings',
  },
  layout: {
    updateTheme: '@overseer/layout/updateTheme',
    notify: '@overseer/common/notify',
    clearNotification: '@overseer/common/clearNotification',
    startLoading: '@overseer/common/startLoading',
    completeLoading: '@overseer/common/completeLoading',
    clearLoading: '@overseer/common/clearLoading',
  },
  users: {
    updateUsers: '@overseer/users/updateUsers',
    updateUser: '@overseer/users/updateUser',
    addUser: '@overseer/users/addUser',
    removeUser: '@overseer/users/removeUser',
  },
  machines: {
    updateMachines: '@overseer/machines/updateMachines',
    updateMachine: '@overseer/machines/updateMachine',
    addMachine: '@overseer/machines/addMachine',
    removeMachine: '@overseer/machines/removeMachine',
    setMachineState: '@overseer/machines/setState',
  },
};

export const actions = {
  common: {
    types: actionsTypes.common,
    initialize(stateProps: Partial<AppState>): TypedAction<Partial<AppState>> {
      return { type: actionsTypes.common.initialize, ...stateProps };
    },
    setActiveUser(activeUser: DisplayUser): TypedAction<DisplayUser> {
      return { type: actionsTypes.common.setActiveUser, ...activeUser };
    },
    clearActiveUser() {
      return { type: actionsTypes.common.clearActiveUser };
    },
    updateSettings(settings: SystemSettings): TypedAction<SystemSettings> {
      return { type: actionsTypes.common.updateSettings, ...settings };
    },
  },
  layout: {
    types: actionsTypes.layout,
    updateTheme(currentTheme: string): TypedAction<{ currentTheme: string }> {
      return { type: actionsTypes.layout.updateTheme, currentTheme };
    },
    notifySuccess(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notify, message, severity: 'success' };
    },
    notifyInfo(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notify, message, severity: 'info' };
    },
    notifyWarning(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notify, message, severity: 'warning' };
    },
    notifyError(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notify, message, severity: 'error' };
    },
    notify(message: string, severity: 'success' | 'info' | 'warning' | 'error'): TypedAction<Notification> {
      return { type: actionsTypes.layout.notify, message, severity };
    },
    clearNotification(): Action {
      return { type: actionsTypes.layout.clearNotification };
    },
    startLoading(): Action {
      return { type: actionsTypes.layout.startLoading };
    },
    completeLoading(): Action {
      return { type: actionsTypes.layout.completeLoading };
    },
    clearLoading(): Action {
      return { type: actionsTypes.layout.clearLoading };
    },
  },
  users: {
    types: actionsTypes.users,
    updateUsers(users: DisplayUser[]): TypedAction<{ users: DisplayUser[] }> {
      return { type: actionsTypes.users.updateUsers, users };
    },
    updateUser(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: actionsTypes.users.updateUser, ...user };
    },
    addUser(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: actionsTypes.users.addUser, ...user };
    },
    removedUser(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: actionsTypes.users.removeUser, ...user };
    },
  },
  machines: {
    types: actionsTypes.machines,
    updateMachines(machines: Machine[]): TypedAction<{ machines: Machine[] }> {
      return { type: actionsTypes.machines.updateMachines, machines };
    },
    updateMachine(machine: Machine): TypedAction<{ machine: Machine }> {
      return { type: actionsTypes.machines.updateMachine, machine };
    },
    addMachine(machine: Machine): TypedAction<{ machine: Machine }> {
      return { type: actionsTypes.machines.addMachine, machine };
    },
    removeMachine(machine: Machine): TypedAction<{ machine: Machine }> {
      return { type: actionsTypes.machines.removeMachine, machine };
    },
    setMachineState(machineState: MachineState): TypedAction<{ machineState: MachineState }> {
      return { type: actionsTypes.machines.setMachineState, machineState };
    },
  },
};
