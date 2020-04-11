import { useMediaQuery, useTheme } from '@material-ui/core';
import * as React from 'react';

import { DispatchContext, StateContext } from './store';
import { AnyAction } from './store/action.type';
import { AppState } from './store/state';

export function useDispatch(): React.Dispatch<AnyAction> {
  return React.useContext(DispatchContext);
}

export function useAppState(): AppState {
  return React.useContext(StateContext);
}

export function useSelector<T>(predicate: (state: AppState) => T): T {
  const state = useAppState();
  const memo = React.useMemo(() => predicate(state), [state]);
  return memo;
}

type MediaBreakpoints = { xs: boolean; sm: boolean; md: boolean; lg: boolean; xl: boolean };
export function useMediaBreakPoints(): MediaBreakpoints {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down('xs'));
  const sm = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  const md = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const lg = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const xl = useMediaQuery(theme.breakpoints.up('lg'));

  return { xs, sm, md, lg, xl };
}
