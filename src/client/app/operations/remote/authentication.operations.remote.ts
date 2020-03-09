import { DisplayUser } from 'overseer_lib';
import { getLocalStorageDataContext } from 'overseer_lib/data';
import { AuthenticationService } from 'overseer_lib/services';
import { defer, Observable } from 'rxjs';

async function withAuthencationSerivce<T>(execute: (service: AuthenticationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new AuthenticationService(context);
  return await execute(service);
}

export function login(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withAuthencationSerivce(service => service.authenticateUser(user)));
}

export function logout(token: string): Observable<DisplayUser> {
  return defer(() => withAuthencationSerivce(service => service.deauthenticateToken(token)));
}

export function logoutUser(userId: number): Observable<DisplayUser> {
  return defer(() => withAuthencationSerivce(service => service.deauthenticateUser(userId)));
}

export function getPreauthenticatedToken(userId: number): Observable<string> {
  throw new Error('Unsupported for this solution');
}

export function validatePreauthenticatedToken(token: string): Observable<DisplayUser> {
  throw new Error('Unsupport for this solution');
}
