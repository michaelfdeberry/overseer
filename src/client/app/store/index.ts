import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

import * as coreEpics from '../core/store/epics';
import { coreReducer, CoreState } from '../core/store/state';
import * as layoutEpics from '../layout/store/epics';
import { layoutReducer, LayoutState } from '../layout/store/state';
import * as configurationEpics from '../pages/configuration/store/epics';
import { configurationReducer, ConfigurationState } from '../pages/configuration/store/state';
import { MonitoringState } from '../pages/monitoring/store/state';

export interface AppState {
  core?: CoreState;
  layout?: LayoutState;
  monitoring?: MonitoringState;
  configuration?: ConfigurationState;
}

const epics = combineEpics<any>(...Object.values(coreEpics), ...Object.values(layoutEpics), ...Object.values(configurationEpics));
const epicMiddleware = createEpicMiddleware();
const middleware: any = [epicMiddleware, createLogger(), ...getDefaultMiddleware()];

const store = configureStore<AppState>({
  reducer: {
    core: coreReducer,
    layout: layoutReducer,
    configuration: configurationReducer,
  },
  middleware,
});

epicMiddleware.run(epics);

export default store;
