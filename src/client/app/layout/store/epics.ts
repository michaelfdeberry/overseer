import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { coreActions } from '../../core/store/state';
import { defaultTheme } from '../../themes';
import { layoutActions } from './state';

export const setTheme = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.initialize.match),
    map(() => {
      const theme = localStorage.getItem('current_theme') || defaultTheme;

      return layoutActions.setTheme(theme);
    })
  );
};
