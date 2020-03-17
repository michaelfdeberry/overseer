import { AnyAction } from 'redux';

import { ConfigurationActionTypes } from './actions';
import { ConfigurationState, initialState } from './state';

export function configurationReducer(state: ConfigurationState = initialState, action: AnyAction): ConfigurationState {
  const { type, ...payload } = action;

  switch (type) {
    case ConfigurationActionTypes.setupLoad:
      return { ...state, setup: { loaded: true, currentStep: 0 } };
    case ConfigurationActionTypes.setupCompleteAdminStep:
      return { ...state, setup: { ...state.setup, adminStepComplete: true, currentStep: state.setup.currentStep + 1 } };
    case ConfigurationActionTypes.setupCompleteMachineStep:
      return { ...state, setup: { ...state.setup, machineStepComplete: true, currentStep: state.setup.currentStep + 1 } };
    case ConfigurationActionTypes.setupCompleteThemeStep:
      return { ...state, setup: { ...state.setup, themeStepComplete: true, currentStep: state.setup.currentStep + 1 } };
    case ConfigurationActionTypes.setupComplete:
      return { ...state, setup: undefined };
    case ConfigurationActionTypes.usersLoad:
      return { ...state, users: { ...state.users, loaded: true } };
    case ConfigurationActionTypes.usersUpdateCreateState:
      return { ...state, users: { ...state.users, createState: payload } };
    case ConfigurationActionTypes.usersComplete:
      return { ...state, users: { ...state.users, createState: undefined, complete: true } };
    case ConfigurationActionTypes.usersCancel:
      return { ...state, users: {} };
    case ConfigurationActionTypes.machinesUpdateState:
      return { ...state, machines: { ...state.machines, formState: payload } };
    case ConfigurationActionTypes.machinesCreateComplete:
    case ConfigurationActionTypes.machinesUpdateComplete:
      return { ...state, machines: { ...state.machines, formState: undefined } };
    default:
      return state;
  }
}
