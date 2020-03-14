import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

import * as coreEpics from '../core/store/epics';
import { coreReducer } from '../core/store/reducer';
import { CoreState } from '../core/store/state';
import * as layoutEpics from '../layout/store/epics';
import { layoutReducer } from '../layout/store/reducer';
import { LayoutState } from '../layout/store/state';
import * as configurationEpics from '../pages/configuration/store/epics';
import { configurationReducer } from '../pages/configuration/store/reducers';
import { ConfigurationState } from '../pages/configuration/store/state';

export interface AppState {
  core?: CoreState;
  layout?: LayoutState;
  configuration?: ConfigurationState;
}

const epics = combineEpics<any>(...Object.values(coreEpics), ...Object.values(layoutEpics), ...Object.values(configurationEpics));
const epicMiddleware = createEpicMiddleware();
const middleware = applyMiddleware(epicMiddleware, createLogger({ collapsed: true }));
const rootReducer = combineReducers<AppState>({
  configuration: configurationReducer,
  core: coreReducer,
  layout: layoutReducer,
});
const store = createStore(rootReducer, undefined, compose(middleware));

epicMiddleware.run(epics);

export default store;
