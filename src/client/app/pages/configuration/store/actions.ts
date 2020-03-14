import { DisplayUser, Machine } from '@overseer/common/models';
import { Action } from 'redux';

import { TypedAction } from '../../../store/action.type';
import { CreateUserFormState } from '../types/create-user-form.state';
import { MachineConfigurationFormState } from '../types/machine-configuration-form.state';

export enum ConfigurationActionTypes {
  setupLoad = '@overseer/client/configuration/setup/load',
  setupSubmitAdminStep = '@overseer/client/configuration/setup/submitAdminStep',
  setupCompleteAdminStep = '@overseer/client/configuration/setup/completeAdminStep',
  setupSubmitMachineStep = '@overseer/client/configuration/setup/submitMachineStep',
  setupCompleteMachineStep = '@overseer/client/configuration/setup/completeMachineStep',
  setupCompleteThemeStep = '@overseer/client/configuration/setup/completeThemeStep',
  setupComplete = '@overseer/client/configuration/setup/complete',
  usersUpdateCreateState = '@overseer/client/configuration/users/updateCreateState',
  usersCreate = '@overseer/client/configuration/users/create',
  usersCreateComplete = '@overseer/client/configuration/users/createComplete',
  machinesUpdateState = '@overseer/client/configuration/machines/updateState',
  machinesCreate = '@overseer/client/configuration/machines/create',
  machinesCreateComplete = '@overseer/client/configuration/machines/createComplete',
  machinesUpdate = '@overseer/client/configuration/machines/update',
  machinesUpdateComplete = '@overseer/client/configuration/machines/updateComplete',
}

export const configurationActions = {
  setup: {
    load(): Action<string> {
      return { type: ConfigurationActionTypes.setupLoad };
    },
    submitAdminStep(): Action<string> {
      return { type: ConfigurationActionTypes.setupSubmitAdminStep };
    },
    completeAdminStep(): Action<string> {
      return { type: ConfigurationActionTypes.setupCompleteAdminStep };
    },
    submitMachineStep(): Action<string> {
      return { type: ConfigurationActionTypes.setupSubmitMachineStep };
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
    updateCreateState(state: CreateUserFormState): TypedAction<CreateUserFormState> {
      return { type: ConfigurationActionTypes.usersUpdateCreateState, ...state };
    },
    create(): Action<string> {
      return { type: ConfigurationActionTypes.usersCreate };
    },
    createComplete(user: DisplayUser): TypedAction<DisplayUser> {
      return { type: ConfigurationActionTypes.usersCreateComplete, ...user };
    },
  },
  machines: {
    updateState(state: MachineConfigurationFormState): TypedAction<MachineConfigurationFormState> {
      return { type: ConfigurationActionTypes.machinesUpdateState, ...state };
    },
    create(): Action<string> {
      return { type: ConfigurationActionTypes.machinesCreate };
    },
    createComplete(machine: Machine): TypedAction<{ machine: Machine }> {
      return { type: ConfigurationActionTypes.machinesCreateComplete, machine };
    },
  },
};
