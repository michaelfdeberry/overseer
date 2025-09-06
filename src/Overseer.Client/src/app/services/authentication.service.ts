import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { User } from '../models/user.model';
import { endpointFactory } from './endpoint-factory';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private getEndpoint = endpointFactory('/api/auth');
  private localStorageService = inject(LocalStorageService);
  private http = inject(HttpClient);

  activeUser = signal(this.localStorageService.get<User>('activeUser'));

  constructor() {
    effect(() => {
      this.updateActiveUser(this.activeUser());
    });
  }

  updateActiveUser(user: User | undefined) {
    if (user) {
      this.localStorageService.set('activeUser', user);
    } else {
      this.localStorageService.remove('activeUser');
    }
  }

  checkLogin(): Observable<boolean> {
    return this.http
      .get(this.getEndpoint())
      .pipe(map(() => true))
      .pipe(catchError(() => of(false)));
  }

  login(user: User): Observable<User> {
    return this.http.post<User>(this.getEndpoint('login'), user).pipe(
      tap((activeUser) => {
        this.activeUser.set(activeUser);
        this.updateActiveUser(activeUser);
      })
    );
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
