import { DisplayUser } from 'overseer_lib';
import { Observable } from 'rxjs';

export abstract class AuthenticationService {
  abstract requiresLogin(): Observable<boolean>;

  abstract login(user: DisplayUser): Observable<DisplayUser>;

  abstract logout(): Observable<DisplayUser>;

  abstract logoutUser(userId: number): Observable<DisplayUser>;

  abstract createInitialUser(user: DisplayUser): Observable<DisplayUser>;

  abstract getPreauthenticatedToken(userId: number): Observable<string>;

  abstract validatePreauthenticatedToken(token: string): Observable<DisplayUser>;
}
