import * as React from 'react';

import { AnyAction } from './action.type';
import { reducer } from './reducer';
import { AppState } from './state';

export const StateContext: React.Context<AppState> = React.createContext<AppState>(null);
export const DispatchContext: React.Context<React.Dispatch<AnyAction>> = React.createContext<React.Dispatch<AnyAction>>(null);

export const Store: React.FunctionComponent<{ children: React.ReactNode }> = props => {
  const initialState: AppState = { isInitialized: false, machineStates: {} };
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{props.children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};
