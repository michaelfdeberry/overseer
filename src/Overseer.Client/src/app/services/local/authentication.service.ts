import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { isTokenExpired, toUser, User } from '../../models/user.model';
import { AuthenticationService } from '../authentication.service';
import { ErrorHandlerService } from '../error-handler.service';
import { IndexedStorageService } from './indexed-storage.service';
import { createUser } from './users.service';

@Injectable({ providedIn: 'root' })
export class LocalAuthenticationService extends AuthenticationService {
  private storage = inject(IndexedStorageService);
  private errorHandler = inject(ErrorHandlerService);
  private injector = inject(EnvironmentInjector);

  supportsPreauthentication = false;

  checkLogin(): Observable<boolean> {
    return this.storage.users.getAll().pipe(
      map((users) => {
        const admins = users.filter((u) => u.accessLevel === 'Administrator');
        const requiresLogin = () => {
          this.activeUser.set(undefined);
          this.errorHandler.handle('unauthorized_access');
          return false;
        };

        if (!admins.length) {
          this.errorHandler.handle('setup_required');
          return false;
        }

        const activeUser = this.activeUser();
        if (!activeUser) return requiresLogin();

        const user = users.find((u) => u.token === activeUser.token);
        if (!user) return requiresLogin();
        if (isTokenExpired(user)) return requiresLogin();

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
          if (pUser.sessionLifetime) {
            pUser.tokenExpiration = Date.now() + pUser.sessionLifetime * 86400000;
          } else {
            pUser.tokenExpiration = undefined;
          }
        }

        return this.storage.users.update(pUser).pipe(
          map(() => {
            const activeUser = toUser(pUser, true);
            this.activeUser.set(activeUser);
            return activeUser;
          })
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  logout(): Observable<Object> {
    const user = this.activeUser();
    if (!user?.id) return of({});

    return this.logoutUser(user.id)
      .pipe(
        tap(() => {
          this.activeUser.set(undefined);
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
    return runInInjectionContext(this.injector, () => createUser(user).pipe(catchError((err) => this.errorHandler.handle(err))));
  }

  getPreauthenticatedToken(userId: number): Observable<string> {
    throw new Error('Unsupported Functionality.');
  }
  validatePreauthenticatedToken(token: string): Observable<User> {
    throw new Error('Unsupported Functionality.');
  }
}
