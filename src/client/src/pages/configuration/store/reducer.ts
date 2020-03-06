import { AnyAction } from 'redux';

import { ConfigurationState, initialState } from './state';

export default function(state: ConfigurationState = initialState, action: AnyAction): ConfigurationState {
  switch (action.type) {
    default:
      return state;
  }
}
