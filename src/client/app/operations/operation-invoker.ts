import { errorMessageMap } from '@overseer/common/error-messages';
import { Observable, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { AnyAction } from '../store/action.type';
import { actions } from '../store/actions';

export function invokeOperation<T>(dispatch: React.Dispatch<AnyAction>, operation: Observable<T>, successMessage?: string): Observable<T> {
  dispatch(actions.layout.startLoading());
  return operation.pipe(
    take(1),
    tap(() => {
      dispatch(actions.layout.completeLoading());

      if (successMessage) {
        dispatch(actions.layout.notifySuccess(successMessage));
      }
    }),
    catchError((error: Error) => {
      const errorMessage = errorMessageMap.hasOwnProperty(error.message) ? errorMessageMap[error.message] : errorMessageMap['unknown'];
      dispatch(actions.layout.notifyError(errorMessage));
      return throwError(error);
    })
  );
}
