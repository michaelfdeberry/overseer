import { AnyAction } from 'redux';

import { initialState, LayoutState } from './state';

export default function(state: LayoutState = initialState, action: AnyAction): LayoutState {
  switch (action.type) {
    default:
      return state;
  }
}
