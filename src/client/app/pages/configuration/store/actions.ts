import { DisplayUser, Machine } from '@overseer/common/models';
import { Action } from 'redux';

import { TypedAction } from '../../../store/action.type';
import { MachineConfigurationFormState } from '../components/machines/machine-configuration-form';

export enum ConfigurationActionTypes {
  setupLoad = '@overseer/client/configuration/setup/load',
  setupSubmitAdminStep = '@overseer/client/configuration/setup/submitAdminStep',
  setupCompleteAdminStep = '@overseer/client/configuration/setup/completeAdminStep',
  setupSubmitMachineStep = '@overseer/client/configuration/setup/submitMachineStep',
  setupCompleteMachineStep = '@overseer/client/configuration/setup/completeMachineStep',
  setupCompleteThemeStep = '@overseer/client/configuration/setup/completeThemeStep',
  setupComplete = '@overseer/client/configuration/setup/complete',
  usersLoad = '@overseer/client/configuration/load',
  usersComplete = '@overseer/client/configuration/users/complete',
  usersCreate = '@overseer/client/configuration/users/create',
  usersChangePassword = '@overseer/client/configuration/users/changePassword',
  usersUpdate = '@overseer/client/configuration/users/update',
  machinesLoad = '@overseer/client/configuration/machines/load',
  machinesComplete = '@overseer/client/configuration/machines/complete',
  machinesCreate = '@overseer/client/configuration/machines/create',
  machinesUpdate = '@overseer/client/configuration/machines/update',
}

export const configurationActions = {
  setup: {
    load(): Action<string> {
      return { type: ConfigurationActionTypes.setupLoad };
    },
    submitAdminStep(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: ConfigurationActionTypes.setupSubmitAdminStep, ...user };
    },
    completeAdminStep(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: ConfigurationActionTypes.setupCompleteAdminStep, ...user };
    },
    submitMachineStep(state: MachineConfigurationFormState): TypedAction<MachineConfigurationFormState> {
      return { type: ConfigurationActionTypes.setupSubmitMachineStep, ...state };
    },
    completeMachineStep(): Action<string> {
      return { type: ConfigurationActionTypes.setupCompleteMachineStep };
    },
    completeThemeStep(): Action<string> {
      return { type: ConfigurationActionTypes.setupCompleteThemeStep };
    },
    complete(): Action<string> {
      return { type: ConfigurationActionTypes.setupComplete };
    },
  },
  users: {
    load(): Action<string> {
      return { type: ConfigurationActionTypes.usersLoad };
    },
    complete(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: ConfigurationActionTypes.usersComplete, ...user };
    },
    createUser(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: ConfigurationActionTypes.usersCreate, ...user };
    },
  },
  machines: {
    load(): Action<string> {
      return { type: ConfigurationActionTypes.machinesLoad };
    },
    complete(machine: Machine): TypedAction<{ machine: Machine }> {
      return { type: ConfigurationActionTypes.machinesComplete, machine };
    },
    createMachine(state): TypedAction<MachineConfigurationFormState> {
      return { type: ConfigurationActionTypes.machinesCreate, ...state };
    },
  },
};
