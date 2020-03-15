import { iif, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { coreActions } from '../core/store/actions';
import { getActiveUser } from '../operations/active-user.operations';
import { authorize } from '../operations/local/authorization.operations.local';

export function catchAndLogError() {
  return catchError((error: Error) => of(coreActions.logError(error.message, error.stack)));
}

export function authorizingMergeMap(project: (value: any) => any) {
  return mergeMap(incomingValue =>
    authorize(getActiveUser()?.token).pipe(
      mergeMap(authenticatedUser => iif(() => !!authenticatedUser, project(incomingValue), of(coreActions.invalidSession())))
    )
  );
}
