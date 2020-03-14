import { AnyAction } from 'redux';

import { CoreActionTypes } from './actions';
import { CoreState, initialState } from './state';

export function coreReducer(state: CoreState = initialState, action: AnyAction): CoreState {
  const { type, ...payload } = action;

  switch (type) {
    case CoreActionTypes.initialize:
      return initialState;
    case CoreActionTypes.initializeComplete:
      return { ...state, isInitialized: true, ...payload };
    case CoreActionTypes.displayError:
      return { ...state, lastErrorMessage: payload.message };
    case CoreActionTypes.clearLastError:
      return { ...state, lastErrorMessage: undefined };
    case CoreActionTypes.machinesOperationComplete:
      return { ...state, machines: payload.machines };
    case CoreActionTypes.usersOperationComplete:
      return { ...state, users: payload.users };
    case CoreActionTypes.settingsOperationComplete:
      return { ...state, settings: payload.settings };
    default:
      return state;
  }
}
