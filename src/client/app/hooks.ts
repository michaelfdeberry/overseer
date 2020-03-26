import * as React from 'react';

import { DispatchContext, StateContext } from './store';
import { AnyAction } from './store/action.type';
import { AppState } from './store/state';

export function useDispatch(): React.Dispatch<AnyAction> {
  return React.useContext(DispatchContext);
}

export function useAppState() {
  return React.useContext(StateContext);
}

export function useSelector<T>(predicate: (state: AppState) => T): T {
  const state = useAppState();
  const memo = React.useMemo(() => predicate(state), [state]);
  return memo;
}
