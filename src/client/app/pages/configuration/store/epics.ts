import { DisplayUser } from 'overseer_lib';
import { Action } from 'redux';
import { StateObservable } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import { coreActions } from '../../../core/store/state';
import { createUser } from '../../../operations/local/users.operations.local';
import { AppState } from '../../../store';
import { configurationActions } from './state';

export const createUserEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    filter(configurationActions.startCreateUser.match),
    withLatestFrom(state$),
    mergeMap(([{ payload }, state]) =>
      createUser(payload as DisplayUser).pipe(
        map(user => {
          if (state.configuration.setupPageLoaded) {
            return configurationActions.completeUserStep(user);
          }

          return configurationActions.completeCreateUser(user);
        }),
        catchError((error: Error) => of(coreActions.handleError({ error: error.message, stack: error.stack })))
      )
    )
  );
};

export const completeUserStepEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(configurationActions.completeUserStep.match),
    map(({ payload }) => configurationActions.completeCreateUser(payload))
  );
};
