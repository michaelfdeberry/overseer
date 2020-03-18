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
      return { ...state, users: { ...state.users, loaded: true, complete: false } };
    case ConfigurationActionTypes.usersComplete:
      return { ...state, users: { ...state.users, loaded: false, complete: true } };
    case ConfigurationActionTypes.machinesComplete:
      return { ...state, machines: { ...state.machines, complete: true } };
    default:
      return state;
  }
}
