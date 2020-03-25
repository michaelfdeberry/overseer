import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';

import { Action, TypedAction } from './action.type';
import { Notification } from './state';

const actionsTypes = {
  common: {
    setActiveUser: '@overseer/common/setActiveUser',
    clearActiveUser: '@overseer/common/clearActiveUser',
    updateSettings: '@overseer/common/updateSettings',
  },
  layout: {
    updateTheme: '@overseer/layout/updateTheme',
    notifySuccess: '@overseer/common/notifySuccess',
    notifyInfo: '@overseer/common/notifyInfo',
    notifyError: '@overseer/common/notifyError',
    notify: '@overseer/common/notify',
    clearNotification: '@overseer/common/clearNotification',
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
  },
};

export const actions = {
  common: {
    types: actionsTypes.common,
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
      return { type: actionsTypes.layout.notifyError, message, severity: 'success' };
    },
    notifyInfo(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notifyInfo, message, severity: 'info' };
    },
    notifyError(message: string): TypedAction<Notification> {
      return { type: actionsTypes.layout.notifyError, message, severity: 'error' };
    },
    notify(message: string, severity: 'success' | 'info' | 'warning' | 'error'): TypedAction<Notification> {
      return { type: actionsTypes.layout.notifyError, message, severity };
    },
    clearNotification(): Action {
      return { type: actionsTypes.layout.clearNotification };
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
  },
};
