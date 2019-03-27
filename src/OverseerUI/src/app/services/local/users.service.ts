import { Injectable } from "@angular/core";

import * as bcrypt from "bcryptjs";
import { Observable, defer } from "rxjs";

import { UsersService } from "../users.service";
import { PersistedUser, toUser, User, AccessLevel } from "../../models/user.model";
import { map, catchError } from "rxjs/operators";
import { UserStorageService } from "./storage/user-storage.service";
import { ErrorHandlerService } from "../error-handler.service";
import { RequireAdministrator } from "../../shared/require-admin.decorator";

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
        sessionLifetime: user.sessionLifetime,
        accessLevel: user.accessLevel
    });

    return toUser(pUser);
}

@Injectable({ providedIn: "root" })
export class LocalUsersService implements UsersService, UserManager {
    constructor(
        public userStorage: UserStorageService,
        private errorHandler: ErrorHandlerService
    ) {}

    @RequireAdministrator()
    getUsers(): Observable<User[]> {
        return defer(() => this.userStorage.getUsers())
            .pipe(map(pUsers => pUsers.map((u: PersistedUser) => toUser(u))))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    getUser(userId: number): Observable<User> {
        return defer(() => this.userStorage.getUserById(userId))
            .pipe(map(pUser => toUser(pUser)))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    createUser(user: User): Observable<User> {
        return defer(() => createUser(this, user))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    updateUser(user: User): Observable<User> {
        const self = this;
        return defer(async function(): Promise<User> {
            const pUser = await self.userStorage.getUserById(user.id);

            pUser.sessionLifetime = user.sessionLifetime;
            pUser.accessLevel = user.accessLevel;
            pUser.token = null;
            pUser.tokenExpiration = null;
            await self.userStorage.updateUser(pUser);

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    deleteUser(user: User): Observable<any> {
        const self = this;
        return defer(async function (): Promise<User> {
            if ((await self.userStorage.getUserCount()) === 1) {
                throw new Error("delete_user_unavailable");
            }

            const users = await self.userStorage.getUsers();
            if (user.accessLevel === AccessLevel.Administrator &&
                users.filter(u => u.accessLevel === AccessLevel.Readonly).length === 1) {
                throw new Error("delete_user_unavailable");
            }

            await self.userStorage.deleteUser(user.id);
            return user;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    changePassword(user: User): Observable<User> {
        const self = this;
        return defer(async function(): Promise<User> {
            const pUser = await self.userStorage.getUserById(user.id);

            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(user.password, salt);
            pUser.passwordHash = hash;
            pUser.passwordSalt = salt;
            pUser.token = null;
            pUser.tokenExpiration = null;
            await self.userStorage.updateUser(pUser);

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }
}
