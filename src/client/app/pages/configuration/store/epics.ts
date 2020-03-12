import { DisplayUser } from '@overseer/common/models';
import { Action } from 'redux';
import { StateObservable } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import { coreActions } from '../../../core/store/state';
import { createMachine } from '../../../operations/local/machines.operations.local';
import { createUser } from '../../../operations/local/users.operations.local';
import { AppState } from '../../../store';
import { MachineConfigurationFormState } from './form-states/machine-configuration-form.state';
import { configurationActions } from './state';

export const submitUserStepEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(configurationActions.submitUserStep.match),
    map(({ payload }) => configurationActions.startCreateUser(payload))
  );
};

export const createUserEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    filter(configurationActions.startCreateUser.match),
    withLatestFrom(state$),
    mergeMap(([{ payload }, state]) =>
      createUser(payload as DisplayUser).pipe(
        map(user => {
          if (state.configuration.completeCurrentStep) {
            return configurationActions.completeSetupUserStep(user);
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
    filter(configurationActions.completeSetupUserStep.match),
    map(({ payload }) => configurationActions.completeCreateUser(payload))
  );
};

export const submitMachineStepEpic = (action$: Observable<Action>) => {
  return action$.pipe(
    filter(configurationActions.submitMachineStep.match),
    map(({ payload }) => configurationActions.startCreateMachine(payload))
  );
};

export const createMachineEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  return action$.pipe(
    filter(configurationActions.startCreateMachine.match),
    withLatestFrom(state$),
    mergeMap(([{ payload }, state]) => {
      const { type, configuration } = payload as MachineConfigurationFormState;
      return createMachine(type, configuration).pipe(
        map(machine => {
          if (state.configuration.completeCurrentStep) {
            return configurationActions.completeSetupMachineStep(machine);
          }

          return configurationActions.completeCreateMachine(machine);
        }),
        catchError((error: Error) => of(coreActions.handleError({ error: error.message, stack: error.stack })))
      );
    })
  );
};

export const completeSetupMachineStepEpic = (action$: Observable<Action>, state$: StateObservable<Action>) => {
  return action$.pipe(
    filter(configurationActions.completeSetupMachineStep.match),
    map(({ payload }) => configurationActions.completeCreateMachine(payload))
  );
};
