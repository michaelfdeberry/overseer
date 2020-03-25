import { getLocalStorageDataContext } from '@overseer/common/data';
import { DisplayUser } from '@overseer/common/models';
import { AuthenticationService } from '@overseer/common/services';
import { defer, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { clearActiveUser, setActiveUser } from '../active-user.operations';

async function withAuthenticationService<T>(execute: (service: AuthenticationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new AuthenticationService(context);
  return await execute(service);
}

export function login(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.authenticateUser(user))).pipe(tap(activeUser => setActiveUser(activeUser)));
}

export function logout(token: string): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.deauthenticateToken(token))).pipe(tap(() => clearActiveUser()));
}

export function logoutUser(userId: string): Observable<DisplayUser> {
  return defer(() => withAuthenticationService(service => service.deauthenticateUser(userId)));
}

export function getPreauthenticatedToken(_userId: string): Observable<string> {
  return throwError("This functionality isn't supported in this mode");
}

export function validatePreauthenticatedToken(_token: string): Observable<DisplayUser> {
  return throwError("This functionality isn't supported in this mode");
}
