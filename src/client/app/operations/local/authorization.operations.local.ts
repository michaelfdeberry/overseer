import { IndexedDBContext } from '@overseer/common/data/indexeddb/indexeddb-context.class';
import { DisplayUser } from '@overseer/common/models';
import { AuthorizationService } from '@overseer/common/services';
import { defer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { clearActiveUser, getActiveUser, setActiveUser } from '../active-user.operations';

async function withAuthorizationService<T>(execute: (service: AuthorizationService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new AuthorizationService(context);
  return await execute(service);
}

export function requiresInitialSetup(): Observable<boolean> {
  return defer(() => withAuthorizationService(service => service.requiresInitialSetup()));
}

export function authorize(): Observable<DisplayUser | null> {
  return defer(() => withAuthorizationService(service => service.authorize(getActiveUser()?.token))).pipe(
    tap(activeUser => {
      if (activeUser) {
        setActiveUser(activeUser);
      } else {
        clearActiveUser();
      }
    })
  );
}
