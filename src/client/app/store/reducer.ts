import { AnyAction } from './action.type';
import { actions } from './actions';
import { AppState } from './state';

export function reducer(state: AppState, { type, ...payload }: AnyAction): AppState {
  switch (type) {
    case actions.common.types.setActiveUser:
      return { ...state, activeUser: payload };
    case actions.common.types.clearActiveUser:
      return { ...state, activeUser: undefined };
    case actions.common.types.displayError:
      return { ...state, lastNotification: payload };
    default:
      return state;
  }
}
