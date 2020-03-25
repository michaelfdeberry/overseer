import { errorMessageMap } from '@overseer/common/error-messages';
import * as React from 'react';
import { ObservableInput, ObservedValueOf, OperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AnyAction } from './action.type';
import { actions } from './actions';

export function catchLogNotify<T, O extends ObservableInput<any>>(dispatch: React.Dispatch<AnyAction>): OperatorFunction<T, T | ObservedValueOf<O>> {
  return catchError((error: Error) => {
    const errorMessage = errorMessageMap.hasOwnProperty(error.message) ? errorMessageMap[error.message] : errorMessageMap['unknown'];

    dispatch(actions.layout.notifyError(errorMessage));
    return throwError(error);
  });
}

export function catchLogThrow<T, O extends ObservableInput<any>>(): OperatorFunction<T, T | ObservedValueOf<O>> {
  return catchError((error: Error) => {
    return throwError(error);
  });
}

// export function authorizingMergeMap(project: (value: any) => any): OperatorFunction<any, any> {
//   return mergeMap((incomingValue: any) =>
//     authorize(getActiveUser()?.token).pipe(
//       mergeMap(authenticatedUser => iif(() => !!authenticatedUser, project(incomingValue), of(coreActions.invalidSession())))
//     )
//   );
// }
