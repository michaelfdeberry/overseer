import { inject, Injectable } from '@angular/core';

import { genSaltSync, hashSync } from 'bcryptjs';
import { Observable, throwError } from 'rxjs';

import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequireAdministrator } from '../../decorators/require-admin.decorator';
import { AccessLevel, PersistedUser, toUser, User } from '../../models/user.model';
import { ErrorHandlerService } from '../error-handler.service';
import { UsersService } from '../users.service';
import { IndexedStorageService } from './indexed-storage.service';

export function createUser(user: User): Observable<User> {
  const storage = inject(IndexedStorageService);

  if (!user) {
    return throwError(() => new Error('invalid_user'));
  }
  if (!user.username) {
    return throwError(() => new Error('invalid_username'));
  }
  if (!user.password) {
    return throwError(() => new Error('invalid_password'));
  }

  return storage.users.getByIndex('username', user.username).pipe(
    mergeMap((u) => {
      if (u) return throwError(() => new Error('unavailable_username'));

      const salt = genSaltSync();
      const hash = hashSync(user.password!, salt);
      const pUser = {
        username: user.username,
        passwordHash: hash,
        passwordSalt: salt,
        sessionLifetime: user.sessionLifetime,
        accessLevel: user.accessLevel,
      };

      return storage.users.add(pUser).pipe(map(() => toUser(pUser)));
    })
  );
}

@Injectable({ providedIn: 'root' })
export class LocalUsersService implements UsersService {
  constructor(private storage: IndexedStorageService, private errorHandler: ErrorHandlerService) {}

  @RequireAdministrator()
  getUsers(): Observable<User[]> {
    return this.storage.users
      .getAll()
      .pipe(map((pUsers) => pUsers.map((u: PersistedUser) => toUser(u))))
      .pipe(catchError((err) => this.errorHandler.handle(err)));
  }

  @RequireAdministrator()
  getUser(userId: number): Observable<User> {
    return this.storage.users
      .getByID(userId)
      .pipe(map((pUser) => toUser(pUser)))
      .pipe(catchError((err) => this.errorHandler.handle(err)));
  }

  @RequireAdministrator()
  createUser(user: User): Observable<User> {
    return createUser(user).pipe(catchError((err) => this.errorHandler.handle(err)));
  }

  @RequireAdministrator()
  updateUser(user: User): Observable<User> {
    return this.storage.users.getByID(user.id!).pipe(
      mergeMap((pUser) => {
        pUser.sessionLifetime = user.sessionLifetime;
        pUser.accessLevel = user.accessLevel;
        pUser.token = undefined;
        pUser.tokenExpiration = undefined;

        return this.storage.users.update(pUser).pipe(
          map((u) => toUser(u)),
          catchError((err) => this.errorHandler.handle(err))
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  @RequireAdministrator()
  deleteUser(user: User): Observable<User> {
    return this.storage.users.getAll().pipe(
      mergeMap((users) => {
        if (users.length === 1) {
          throw new Error('delete_user_unavailable');
        }

        const remainingAdmins = users.filter((u) => u.accessLevel === AccessLevel.Administrator);
        if (user.accessLevel === AccessLevel.Administrator && remainingAdmins.length === 1) {
          throw new Error('delete_user_unavailable');
        }

        return this.storage.users.deleteRecord(user.id!).pipe(
          map(() => user),
          catchError((err) => this.errorHandler.handle(err))
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  changePassword(user: User): Observable<User> {
    return this.storage.users.getByID(user.id!).pipe(
      mergeMap((pUser) => {
        const salt = genSaltSync();
        const hash = hashSync(user.password!, salt);
        pUser.passwordHash = hash;
        pUser.passwordSalt = salt;
        pUser.token = undefined;
        pUser.tokenExpiration = undefined;

        return this.storage.users.update(pUser).pipe(
          map((u) => toUser(u)),
          catchError((err) => this.errorHandler.handle(err))
        );
      }),
      catchError((err) => this.errorHandler.handle(err))
    );
  }
}
