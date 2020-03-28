import { getLocalStorageDataContext } from '@overseer/common/data';
import { DisplayUser } from '@overseer/common/models';
import { AuthorizationService } from '@overseer/common/services';
import { defer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { clearActiveUser, setActiveUser } from '../active-user.operations';

async function withAuthorizationService<T>(execute: (service: AuthorizationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new AuthorizationService(context);
  return await execute(service);
}

export function requiresInitialSetup(): Observable<boolean> {
  return defer(() => withAuthorizationService(service => service.requiresInitialSetup()));
}

export function authorize(token: string): Observable<DisplayUser | null> {
  return defer(() => withAuthorizationService(service => service.authorize(token))).pipe(
    tap(activeUser => {
      if (activeUser) {
        setActiveUser(activeUser);
      } else {
        clearActiveUser();
      }
    })
  );
}
