import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { coreActions } from './actions';

export function logError() {
  return catchError((error: Error) => of(coreActions.logError(error.message, error.stack)));
}
