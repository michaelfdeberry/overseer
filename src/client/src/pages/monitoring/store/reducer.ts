import { AnyAction } from 'redux';

import { initialState, MonitoringState } from './state';

export default function(state: MonitoringState = initialState, action: AnyAction): MonitoringState {
  switch (action.type) {
    default:
      return state;
  }
}
