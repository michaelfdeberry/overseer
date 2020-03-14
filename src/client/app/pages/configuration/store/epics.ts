import { DisplayUser, Machine } from '@overseer/common/models';
import { Action } from 'redux';
import { ofType, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

import { coreActions } from '../../../core/store/actions';
import { logError } from '../../../core/store/operators';
import { setActiveUser } from '../../../operations/active-user.operations';
import { login } from '../../../operations/local/authentication.operations.local';
import { createMachine } from '../../../operations/local/machines.operations.local';
import { createUser } from '../../../operations/local/users.operations.local';
import { AppState } from '../../../store';
import { TypedAction } from '../../../store/action.type';
import { configurationActions, ConfigurationActionTypes } from './actions';

export const setupSubmitAdminStep = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitAdminStep),
    withLatestFrom(state$),
    mergeMap(([, { configuration: { users: { createState } } }]) =>
      createUser(createState as DisplayUser).pipe(
        mergeMap(() =>
          login(createState as DisplayUser).pipe(
            tap(activeUser => setActiveUser(activeUser)),
            map(() => configurationActions.setup.completeAdminStep())
          )
        ),
        logError()
      )
    )
  );
};

export const setupSubmitMachineStep = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitMachineStep),
    withLatestFrom(state$),
    mergeMap(([, { configuration: { machines: { formState } } }]) =>
      createMachine(formState.machineType, formState.configuration).pipe(
        map(() => configurationActions.setup.completeMachineStep()),
        logError()
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
    withLatestFrom(state$),
    mergeMap(([, { configuration: { users: { createState } } }]) =>
      createUser(createState as DisplayUser).pipe(
        map(user => configurationActions.users.createComplete(user)),
        logError()
      )
    )
  );
};

export const usersCreateCompleteEpic = (action$: Observable<TypedAction<DisplayUser>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.usersCreateComplete),
    withLatestFrom(state$),
    map(([{ type, ...user }, { core: { users } }]) => coreActions.usersOperationComplete([user, ...users.filter(u => u.id !== user.id)]))
  );
};

export const machineCreateEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.machinesCreate),
    withLatestFrom(state$),
    mergeMap(([, { configuration: { machines: { formState } } }]) =>
      createMachine(formState.machineType, formState.configuration).pipe(
        map(machine => configurationActions.machines.createComplete(machine)),
        logError()
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
