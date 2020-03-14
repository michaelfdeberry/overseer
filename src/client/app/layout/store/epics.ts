import { Action } from 'redux';
import { ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { CoreActionTypes } from '../../core/store/actions';
import { getCurrentTheme, setCurrentTheme } from '../../operations/theme.operations';
import { TypedAction } from '../../store/action.type';
import { layoutActions, LayoutActionTypes } from './actions';

export const loadThemeEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.initialize),
    map(() => layoutActions.updateTheme(getCurrentTheme()))
  );
};

export const updateThemeEpic = (action$: Observable<TypedAction<{ currentTheme: string }>>) => {
  return action$.pipe(
    ofType(LayoutActionTypes.updateTheme),
    tap(({ currentTheme }) => setCurrentTheme(currentTheme)),
    map(() => layoutActions.updateThemeComplete())
  );
};
