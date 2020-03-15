import { errorMessageMap } from '@overseer/common/error-messages';
import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';
import { Action } from 'redux';
import { ofType, StateObservable } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { map, mergeMap, pluck, tap, withLatestFrom } from 'rxjs/operators';

import { clearActiveUser, getActiveUser, setActiveUser } from '../../operations/active-user.operations';
import { login, logout, logoutUser } from '../../operations/local/authentication.operations.local';
import { authorize, requiresInitialSetup } from '../../operations/local/authorization.operations.local';
import { getSettings, updateSettings } from '../../operations/local/configuration.operations.local';
import { getMachines, updateMachine } from '../../operations/local/machines.operations.local';
import { getUsers, updateUser } from '../../operations/local/users.operations.local';
import { AppState } from '../../store';
import { TypedAction } from '../../store/action.type';
import { authorizingMergeMap, catchAndLogError } from '../../store/operators';
import { coreActions, CoreActionTypes } from './actions';

export const initializeEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.initialize),
    mergeMap(() =>
      requiresInitialSetup().pipe(
        mergeMap(requiresSetup => {
          const activeUser = getActiveUser();
          if (!activeUser) {
            return of(
              coreActions.initializeComplete({
                requiresSetup,
                isLocalApp: true,
                activeUser,
              })
            );
          }

          return authorize(activeUser.token).pipe(
            map(authorizedUser =>
              coreActions.initializeComplete({
                requiresSetup,
                isLocalApp: true,
                activeUser: authorizedUser,
              })
            )
          );
        }),
        catchAndLogError()
      )
    )
  );
};

export const fetchMachinesEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchMachines),
    authorizingMergeMap(() =>
      getMachines().pipe(
        map(machines => coreActions.machinesOperationComplete(machines)),
        catchAndLogError()
      )
    )
  );
};

export const updateMachineEpic = (action$: Observable<TypedAction<{ machine: Machine }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateMachine),
    withLatestFrom(state$.pipe(pluck('core', 'machines'))),
    authorizingMergeMap(([{ machine }, machines]) =>
      updateMachine(machine).pipe(
        map(updatedMachine => coreActions.machinesOperationComplete([updatedMachine, ...machines.filter(m => m.id !== updatedMachine.id)])),
        catchAndLogError()
      )
    )
  );
};

export const fetchUsersEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchUsers),
    authorizingMergeMap(() =>
      getUsers().pipe(
        map(users => coreActions.usersOperationComplete(users)),
        catchAndLogError()
      )
    )
  );
};

export const updateUserEpic = (action$: Observable<TypedAction<{ user: DisplayUser }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateUser),
    withLatestFrom(state$.pipe(pluck('core', 'users'))),
    authorizingMergeMap(([{ user }, users]) =>
      updateUser(user).pipe(
        map(updatedUser => coreActions.usersOperationComplete([updatedUser, ...users.filter(u => u.id !== updatedUser.id)])),
        catchAndLogError()
      )
    )
  );
};

export const fetchSettingsEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchSettings),
    authorizingMergeMap(() =>
      getSettings().pipe(
        map(settings => coreActions.settingsOperationComplete(settings)),
        catchAndLogError()
      )
    )
  );
};

export const updateSettingsEpic = (action$: Observable<TypedAction<{ settings: SystemSettings }>>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateSettings),
    authorizingMergeMap(({ settings }) =>
      updateSettings(settings).pipe(
        map(() => coreActions.settingsOperationComplete(settings)),
        catchAndLogError()
      )
    )
  );
};

export const signInEpic = (action$: Observable<TypedAction<{ user: DisplayUser }>>) => {
  return action$.pipe(
    ofType(CoreActionTypes.signIn),
    mergeMap(({ user }) =>
      login(user).pipe(
        tap(activeUser => setActiveUser(activeUser)),
        map(activeUser => coreActions.signInComplete(activeUser)),
        catchAndLogError()
      )
    )
  );
};

export const signOutEpic = (action$: Observable<TypedAction<{ user: DisplayUser }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.signOut),
    withLatestFrom(state$.pipe(pluck('core'))),
    mergeMap(([{ user }, { activeUser, users }]) => {
      if (user) {
        return logoutUser(user.id).pipe(
          map(updatedUser => coreActions.usersOperationComplete([updatedUser, ...users.filter(u => u.id !== user.id)])),
          catchAndLogError()
        );
      } else {
        return logout(activeUser.token).pipe(
          tap(() => clearActiveUser()),
          map(() => coreActions.initialize()),
          catchAndLogError()
        );
      }
    })
  );
};

export const logErrorEpic = (action$: Observable<TypedAction<{ message: string; stack?: string }>>) => {
  return action$.pipe(
    ofType(CoreActionTypes.logError),
    map(({ message, stack }) => {
      console.error(message, stack);

      const errorMessage = errorMessageMap.hasOwnProperty(message) ? errorMessageMap[message] : errorMessageMap['unknown'];
      return coreActions.displayError(errorMessage);
    })
  );
};

export const invalidSessionEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.invalidSession),
    map(() => {
      clearActiveUser();
      return coreActions.initialize();
    })
  );
};
