import { Injectable } from "@angular/core";

import * as bcrypt from "bcryptjs";
import { Observable, defer } from "rxjs";

import { UsersService } from "../users.service";
import { PersistedUser, toUser, User } from "../../models/user.model";
import { map, catchError } from "rxjs/operators";
import { UserStorageService } from "./storage/user-storage.service";
import { ErrorHandlerService } from "../error-handler.service";

export interface UserManager {
    userStorage: UserStorageService;
}

export async function createUser(userManager: UserManager, user: User): Promise<User> {
    if (!user) { throw new Error("invalid_user"); }
    if (!user.username) { throw new Error("invalid_username"); }
    if (!user.password) { throw new Error("invalid_password"); }
    if (await userManager.userStorage.getUserByUsername(user.username)) {
        throw new Error("unavailable_username");
    }

    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.password, salt);
    const pUser = await userManager.userStorage.createUser({
        username: user.username,
        passwordHash: hash,
        passwordSalt: salt,
        sessionLifetime: user.sessionLifetime
    });

    return toUser(pUser);
}

@Injectable({ providedIn: "root" })
export class LocalUsersService implements UsersService, UserManager {
    constructor(
        public userStorage: UserStorageService,
        private errorHandler: ErrorHandlerService
    ) {}

    getUsers(): Observable<User[]> {
        return defer(() => this.userStorage.getUsers())
            .pipe(map(pUsers => pUsers.map((u: PersistedUser) => toUser(u))))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    getUser(userId: number): Observable<User> {
        return defer(() => this.userStorage.getUserById(userId))
            .pipe(map(pUser => toUser(pUser)))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    createUser(user: User): Observable<User> {
        return defer<User>(() => createUser(this, user))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    updateUser(user: User): Observable<User> {
        const self = this;
        return defer<User>(async function(): Promise<User> {
            const pUser = await self.userStorage.getUserById(user.id);

            if (user.password) {
                const salt = bcrypt.genSaltSync();
                const hash = bcrypt.hashSync(user.password, salt);
                pUser.passwordHash = hash;
                pUser.passwordSalt = salt;

            } else {
                pUser.sessionLifetime = user.sessionLifetime;
            }

            pUser.token = null;
            pUser.tokenExpiration = null;
            await self.userStorage.updateUser(pUser);

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    deleteUser(user: User): Observable<any> {
        const self = this;
        return defer<User>(async function (): Promise<User> {
            if ((await self.userStorage.getUserCount()) === 1) {
                throw new Error("delete_user_unavailable");
            }

            await self.userStorage.deleteUser(user.id);
            return user;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }
}
