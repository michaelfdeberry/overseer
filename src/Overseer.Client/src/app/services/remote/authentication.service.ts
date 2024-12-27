import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthenticationService } from '../authentication.service';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export class RemoteAuthenticationService extends AuthenticationService {
  private getEndpoint = endpointFactory('/api/auth');
  private http = inject(HttpClient);

  supportsPreauthentication = true;

  checkLogin(): Observable<boolean> {
    return this.http
      .get(this.getEndpoint())
      .pipe(map(() => true))
      .pipe(catchError(() => of(false)));
  }

  login(user: User): Observable<User> {
    return this.http.post<User>(this.getEndpoint('login'), user).pipe(tap((activeUser) => this.updateActiveUser(activeUser)));
  }

  logout(): Observable<Object> {
    return this.http.delete(this.getEndpoint('logout')).pipe(
      tap(() => {
        this.activeUser.set(undefined);
      })
    );
  }

  logoutUser(userId: number): Observable<User> {
    return this.http.post<User>(this.getEndpoint('logout', userId), {});
  }

  createInitialUser(user: User): Observable<User> {
    return this.http.post<User>(this.getEndpoint('setup'), user);
  }

  getPreauthenticatedToken(userId: number): Observable<string> {
    return this.http.get(this.getEndpoint('sso', userId), {
      responseType: 'text',
    });
  }

  validatePreauthenticatedToken(token: string): Observable<User> {
    return this.http.post<User>(this.getEndpoint('sso'), token).pipe(tap((activeUser) => this.activeUser.set(activeUser)));
  }
}
