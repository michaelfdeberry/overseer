import { AnyAction } from 'redux';

import { LayoutActionTypes } from './actions';
import { initialState, LayoutState } from './state';

export function layoutReducer(state: LayoutState = initialState, action: AnyAction): LayoutState {
  const { type, ...payload } = action;

  switch (type) {
    case LayoutActionTypes.updateTheme:
      return { ...state, ...payload };
    default:
      return state;
  }
}
