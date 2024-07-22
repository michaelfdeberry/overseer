import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { LocalStorageService } from 'ngx-store';
import { defer, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { isTokenExpired, toUser, User, AccessLevel } from '../../models/user.model';
import { AuthenticationService } from '../authentication.service';
import { ErrorHandlerService } from '../error-handler.service';
import { IndexedStorageService } from './indexed-storage.service';
import { createUser, UserManager } from './users.service';

@Injectable({ providedIn: 'root' })
export class LocalAuthenticationService implements AuthenticationService, UserManager {
  supportsPreauthentication = false;

  public readonly authenticationChangeEvent$ = new Subject<User | undefined>();

  constructor(
    public storage: IndexedStorageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  get activeUser(): User {
    return this.localStorageService.get('activeUser');
  }

  requiresLogin(): Observable<boolean> {
    return this.storage.users.getAll().pipe(
      map((users) => {
        const admins = users.filter((u) => u.accessLevel === AccessLevel.Administrator);

        if (!admins.length) {
          this.router.navigate(['/configuration', 'setup']);
          this.errorHandler.handle('setup_required');
          return false;
        }

        if (!this.localStorageService.get('activeUser')) {
          this.router.navigate(['/login']);
          this.errorHandler.handle('unauthorized_access');
          return false;
        }

        return true;
      })
    );
  }

  login(user: User): Observable<User> {
    if (!user.username) {
      return throwError(() => new Error('invalid_username'));
    }
    if (!user.password) {
      return throwError(() => new Error('invalid_password'));
    }

    return this.storage.users.getByIndex('username', user.username).pipe(
      mergeMap((pUser) => {
        if (!pUser) {
          return throwError(() => new Error('invalid_username'));
        }

        const hash = bcrypt.hashSync(user.password!, pUser.passwordSalt);
        if (hash !== pUser.passwordHash) {
          return throwError(() => new Error('invalid_password'));
        }

        if (isTokenExpired(pUser)) {
          pUser.token = bcrypt.genSaltSync(16);
          if (user.sessionLifetime) {
            pUser.tokenExpiration = Date.now() + user.sessionLifetime * 86400;
          } else {
            pUser.tokenExpiration = undefined;
          }
        }

        return this.storage.users.update(pUser).pipe(
          map(() => {
            const activeUser = toUser(pUser, true);
            this.localStorageService.set('activeUser', activeUser);
            this.authenticationChangeEvent$.next(activeUser);
            return activeUser;
          })
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  logout(): Observable<Object> {
    return this.logoutUser(this.activeUser.id!)
      .pipe(
        tap(() => {
          this.localStorageService.remove('activeUser');
          this.authenticationChangeEvent$.next(undefined);
        })
      )
      .pipe(catchError((err) => this.errorHandler.handle(err)));
  }

  logoutUser(userId: number): Observable<User> {
    return this.storage.users.getByID(userId).pipe(
      mergeMap((pUser) => {
        pUser.token = undefined;
        pUser.tokenExpiration = undefined;

        return this.storage.users.update(pUser).pipe(
          map(() => toUser(pUser)),
          catchError((err) => this.errorHandler.handle(err))
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  createInitialUser(user: User): Observable<User> {
    return defer(() => createUser(this, user)).pipe(catchError((err) => this.errorHandler.handle(err)));
  }

  getPreauthenticatedToken(userId: number): Observable<string> {
    throw new Error('Unsupported Functionality.');
  }
  validatePreauthenticatedToken(token: string): Observable<User> {
    throw new Error('Unsupported Functionality.');
  }
}
