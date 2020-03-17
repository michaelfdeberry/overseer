import { getLocalStorageDataContext } from '@overseer/common/data';
import { DisplayUser } from '@overseer/common/models';
import { AuthenticationService } from '@overseer/common/services';
import { defer, Observable } from 'rxjs';

async function withAuthenticationService<T>(execute: (service: AuthenticationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new AuthenticationService(context);
  return await execute(service);
}

export function login(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.authenticateUser(user)));
}

export function logout(token: string): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.deauthenticateToken(token)));
}

export function logoutUser(userId: string): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.deauthenticateUser(userId)));
}

export function getPreauthenticatedToken(userId: string): Observable<string> {
  throw new Error('Unsupported for this solution');
}

export function validatePreauthenticatedToken(token: string): Observable<DisplayUser> {
  throw new Error('Unsupport for this solution');
}
