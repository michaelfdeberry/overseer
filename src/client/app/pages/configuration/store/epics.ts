import { DisplayUser, Machine } from '@overseer/common/models';
import { Action } from 'redux';
import { ofType, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { map, mergeMap, pluck, tap, withLatestFrom } from 'rxjs/operators';

import { coreActions } from '../../../core/store/actions';
import { setActiveUser } from '../../../operations/active-user.operations';
import { login } from '../../../operations/local/authentication.operations.local';
import { createMachine } from '../../../operations/local/machines.operations.local';
import { createUser } from '../../../operations/local/users.operations.local';
import { AppState } from '../../../store';
import { TypedAction } from '../../../store/action.type';
import { authorizingMergeMap, catchAndLogError } from '../../../store/operators';
import { configurationActions, ConfigurationActionTypes } from './actions';

export const setupSubmitAdminStep = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitAdminStep),
    withLatestFrom(state$.pipe(pluck('configuration', 'users', 'createState'))),
    mergeMap(([, { isValid, ...createdUser }]) =>
      createUser(createdUser).pipe(
        mergeMap(() =>
          login(createdUser).pipe(
            tap(activeUser => setActiveUser(activeUser)),
            map(() => configurationActions.setup.completeAdminStep())
          )
        ),
        catchAndLogError()
      )
    )
  );
};

export const setupSubmitMachineStep = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitMachineStep),
    withLatestFrom(state$.pipe(pluck('configuration', 'machines', 'formState'))),
    authorizingMergeMap(([, { machineType, configuration }]) =>
      createMachine(machineType, configuration).pipe(
        map(() => configurationActions.setup.completeMachineStep()),
        catchAndLogError()
      )
    )
  );
};

export const setupComplete = (action$: Observable<Action>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupComplete),
    map(() => coreActions.initialize())
  );
};

export const usersCreateEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.usersCreate),
    withLatestFrom(state$.pipe(pluck('configuration', 'users', 'createState'))),
    authorizingMergeMap(([, { isValid, ...createdUser }]) =>
      createUser(createdUser).pipe(
        map(user => configurationActions.users.complete(user)),
        catchAndLogError()
      )
    )
  );
};

export const usersCompleteEpic = (action$: Observable<TypedAction<DisplayUser>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.usersComplete),
    withLatestFrom(state$),
    map(([{ type, ...user }, { core: { users } }]) => coreActions.usersOperationComplete([...users.filter(u => u.id !== user.id), user]))
  );
};

export const machineCreateEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.machinesCreate),
    withLatestFrom(state$.pipe(pluck('configuration', 'machines', 'formState'))),
    authorizingMergeMap(([, { machineType, configuration }]) =>
      createMachine(machineType, configuration).pipe(
        map(machine => configurationActions.machines.createComplete(machine)),
        catchAndLogError()
      )
    )
  );
};

export const machineCreateCompleteEpic = (action$: Observable<TypedAction<Machine>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.machinesCreateComplete),
    withLatestFrom(state$),
    map(([machine, { core: { machines } }]) => coreActions.machinesOperationComplete([machine, ...machines.filter(m => m.id !== machine.id)]))
  );
};
