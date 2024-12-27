import { effect, inject, Injectable, signal, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export abstract class AuthenticationService {
  private localStorageService = inject(LocalStorageService);

  abstract readonly supportsPreauthentication: boolean;
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

  abstract checkLogin(): Observable<boolean>;

  abstract login(user: User): Observable<User>;

  abstract logout(): Observable<Object>;

  abstract logoutUser(userId: number): Observable<User>;

  abstract createInitialUser(user: User): Observable<User>;

  abstract getPreauthenticatedToken(userId: number): Observable<string>;

  abstract validatePreauthenticatedToken(token: string): Observable<User>;
}
