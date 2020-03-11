import { DisplayUser } from '@overseer/common/models';
import { Action } from 'redux';
import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

import { logout } from '../../operations/local/authentication.operations.local';
import { requiresInitialSetup } from '../../operations/local/authorization.operations.local';
import { getSettings } from '../../operations/local/configuration.operations.local';
import { getMachines } from '../../operations/local/machines.operations.local';
import { getUsers } from '../../operations/local/users.operations.local';
import { AppState } from '../../store';
import { errorMessageMap } from '../error-messages';
import { coreActions } from './state';

export const initializeEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.initialize.match),
    tap(() => {
      // TODO: perform app configuration
    }),
    mergeMap(() =>
      requiresInitialSetup().pipe(
        map(setupRequired => {
          return setupRequired ? coreActions.requiresInitialSetup() : coreActions.initializeComplete();
        })
      )
    )
  );
};

export const loadActiveUserEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.initializeComplete.match),
    map(() => {
      const activeUserJson = localStorage.getItem('active_user');
      if (!activeUserJson) return coreActions.loadActiveUser();

      const activeUser: DisplayUser = JSON.parse(activeUserJson);
      return coreActions.loadActiveUser(activeUser);
    })
  );
};

export const loadMachinesEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.loadActiveUser.match),
    filter(({ payload }) => !!payload),
    mergeMap(() => getMachines().pipe(map(machines => coreActions.loadMachines(machines))))
  );
};

export const loadUsersEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.loadActiveUser.match),
    filter(({ payload }) => !!payload),
    mergeMap(() => getUsers().pipe(map(users => coreActions.loadUsers(users))))
  );
};

export const loadSystemSettingsEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.loadActiveUser.match),
    filter(({ payload }) => !!payload),
    mergeMap(() => getSettings().pipe(map(settings => coreActions.loadSystemSettings(settings))))
  );
};

export const logoutEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    filter(coreActions.startLogout.match),
    withLatestFrom(state$),
    mergeMap(([, { core: { activeUser } }]) => logout(activeUser.token).pipe(map(() => coreActions.completeLogout())))
  );
};

export const handleErrorEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(coreActions.handleError.match),
    map(({ payload: { error, stack } }) => {
      console.log(error, stack);
      const errorMessage = errorMessageMap.hasOwnProperty(error) ? errorMessageMap[error] : errorMessageMap['unknown'];
      return coreActions.displayError(errorMessage);
    })
  );
};
