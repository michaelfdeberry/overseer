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
import { MachineConfigurationFormState } from '../components/machines/machine-configuration-form';
import { configurationActions, ConfigurationActionTypes } from './actions';

export const setupSubmitAdminStep = (action$: Observable<TypedAction<DisplayUser>>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitAdminStep),
    mergeMap(({ type, ...user }) =>
      createUser(user).pipe(
        mergeMap(() =>
          login(user).pipe(
            tap(activeUser => setActiveUser(activeUser)),
            map(activeUser => configurationActions.setup.completeAdminStep(activeUser))
          )
        ),
        catchAndLogError()
      )
    )
  );
};

export const setupSubmitMachineStep = (action$: Observable<TypedAction<MachineConfigurationFormState>>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.setupSubmitMachineStep),
    authorizingMergeMap(({ machineType, configuration }) =>
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

export const usersCreateEpic = (action$: Observable<TypedAction<DisplayUser>>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.usersCreate),
    authorizingMergeMap(({ type, ...user }) =>
      createUser(user).pipe(
        map(createdUser => configurationActions.users.complete(createdUser)),
        catchAndLogError()
      )
    )
  );
};

export const usersCompleteEpic = (action$: Observable<TypedAction<DisplayUser>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.usersComplete),
    withLatestFrom(state$.pipe(pluck('core', 'users'))),
    map(([{ type, ...user }, users]) => coreActions.usersOperationComplete([...users.filter(u => u.id !== user.id), user]))
  );
};

export const machineCreateEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.machinesCreate),
    withLatestFrom(state$.pipe(pluck('configuration', 'machines', 'formState'))),
    authorizingMergeMap(([, { machineType, configuration }]) =>
      createMachine(machineType, configuration).pipe(
        map(machine => configurationActions.machines.complete(machine)),
        catchAndLogError()
      )
    )
  );
};

export const machineCreateCompleteEpic = (action$: Observable<TypedAction<Machine>>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    ofType(ConfigurationActionTypes.machinesComplete),
    withLatestFrom(state$),
    map(([machine, { core: { machines } }]) => coreActions.machinesOperationComplete([machine, ...machines.filter(m => m.id !== machine.id)]))
  );
};
