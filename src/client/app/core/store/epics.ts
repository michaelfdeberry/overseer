import { errorMessageMap } from '@overseer/common/error-messages';
import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';
import { Action } from 'redux';
import { ofType, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

import { clearActiveUser, getActiveUser } from '../../operations/active-user.operations';
import { logout, logoutUser } from '../../operations/local/authentication.operations.local';
import { requiresInitialSetup } from '../../operations/local/authorization.operations.local';
import { getSettings, updateSettings } from '../../operations/local/configuration.operations.local';
import { getMachines, updateMachine } from '../../operations/local/machines.operations.local';
import { getUsers, updateUser } from '../../operations/local/users.operations.local';
import { AppState } from '../../store';
import { TypedAction } from '../../store/action.type';
import { coreActions, CoreActionTypes } from './actions';
import { logError } from './operators';

export const initializeEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.initialize),
    mergeMap(() =>
      requiresInitialSetup().pipe(
        map(requiresSetup =>
          coreActions.initializeComplete({
            requiresSetup,
            isLocalApp: true,
            activeUser: getActiveUser(),
          })
        ),
        logError()
      )
    )
  );
};

export const fetchMachinesEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchMachines),
    mergeMap(() =>
      getMachines().pipe(
        map(machines => coreActions.machinesOperationComplete(machines)),
        logError()
      )
    )
  );
};

export const updateMachineEpic = (action$: Observable<TypedAction<{ machine: Machine }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateMachine),
    withLatestFrom(state$),
    mergeMap(([{ machine }, { core: { machines } }]) =>
      updateMachine(machine).pipe(
        map(updatedMachine => coreActions.machinesOperationComplete([updatedMachine, ...machines.filter(m => m.id !== updatedMachine.id)])),
        logError()
      )
    )
  );
};

export const fetchUsersEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchUsers),
    mergeMap(() =>
      getUsers().pipe(
        map(users => coreActions.usersOperationComplete(users)),
        logError()
      )
    )
  );
};

export const updateUserEpic = (action$: Observable<TypedAction<{ user: DisplayUser }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateUser),
    withLatestFrom(state$),
    mergeMap(([{ user }, { core: { users } }]) =>
      updateUser(user).pipe(
        map(updatedUser => coreActions.usersOperationComplete([updatedUser, ...users.filter(u => u.id !== updatedUser.id)])),
        logError()
      )
    )
  );
};

export const fetchSettingsEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(CoreActionTypes.fetchSettings),
    mergeMap(() =>
      getSettings().pipe(
        map(settings => coreActions.settingsOperationComplete(settings)),
        logError()
      )
    )
  );
};

export const updateSettingsEpic = (action$: Observable<TypedAction<{ settings: SystemSettings }>>) => {
  return action$.pipe(
    ofType(CoreActionTypes.updateSettings),
    mergeMap(({ settings }) =>
      updateSettings(settings).pipe(
        map(() => coreActions.settingsOperationComplete(settings)),
        logError()
      )
    )
  );
};

export const signOutEpic = (action$: Observable<TypedAction<{ user: DisplayUser }>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(CoreActionTypes.signOut),
    withLatestFrom(state$),
    mergeMap(
      ([
        { user },
        {
          core: { activeUser, users },
        },
      ]) => {
        if (user) {
          return logoutUser(user.id).pipe(
            map(updatedUser => coreActions.usersOperationComplete([updatedUser, ...users.filter(u => u.id !== user.id)])),
            logError()
          );
        } else {
          return logout(activeUser.token).pipe(
            tap(() => clearActiveUser()),
            map(() => coreActions.initialize()),
            logError()
          );
        }
      }
    )
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
