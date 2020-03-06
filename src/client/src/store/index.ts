import { combineReducers, createStore } from 'redux';

import layout from '../layout/store/reducer';
import { LayoutState } from '../layout/store/state';
import configuration from '../pages/configuration/store/reducer';
import { ConfigurationState } from '../pages/configuration/store/state';
import monitoring from '../pages/monitoring/store/reducer';
import { MonitoringState } from '../pages/monitoring/store/state';
import common from './reducer';
import { CommonState } from './state';

export interface AppState {
  common?: CommonState;
  layout?: LayoutState;
  monitoring?: MonitoringState;
  configuration?: ConfigurationState;
}

const rootReducer = combineReducers<AppState>({ common, layout, monitoring, configuration });
const store = createStore(rootReducer);

export default store;
