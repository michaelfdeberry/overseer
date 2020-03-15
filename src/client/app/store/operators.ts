import { iif, of, OperatorFunction } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { coreActions } from '../core/store/actions';
import { getActiveUser } from '../operations/active-user.operations';
import { authorize } from '../operations/local/authorization.operations.local';

export function catchAndLogError(): OperatorFunction<any, any> {
  return catchError((error: Error) => of(coreActions.logError(error.message, error.stack)));
}

export function authorizingMergeMap(project: (value: any) => any): OperatorFunction<any, any> {
  return mergeMap((incomingValue: any) =>
    authorize(getActiveUser()?.token).pipe(
      mergeMap(authenticatedUser => iif(() => !!authenticatedUser, project(incomingValue), of(coreActions.invalidSession())))
    )
  );
}
