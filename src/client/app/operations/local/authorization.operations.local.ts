import { DisplayUser } from 'overseer_lib';
import { getLocalStorageDataContext } from 'overseer_lib/data';
import { AuthorizationService } from 'overseer_lib/services';
import { defer, Observable } from 'rxjs';

async function withAuthorizationService<T>(execute: (service: AuthorizationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new AuthorizationService(context);
  return await execute(service);
}

export function requiresInitialSetup(): Observable<boolean> {
  return defer(() => withAuthorizationService(service => service.requiresIntialSetup()));
}

export function authorize(token: string): Observable<DisplayUser | null> {
  return defer(() => withAuthorizationService(service => service.authorize(token)));
}
