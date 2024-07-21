import { Injectable } from "@angular/core";

import * as bcrypt from "bcryptjs";
import { Observable, defer } from "rxjs";

import { UsersService } from "../users.service";
import { PersistedUser, toUser, User, AccessLevel } from "../../models/user.model";
import { map, catchError } from "rxjs/operators";
import { ErrorHandlerService } from "../error-handler.service";
import { RequireAdministrator } from "../../shared/require-admin.decorator";
import { IndexedStorageService } from "./indexed-storage.service";

export interface UserManager {
    storage: IndexedStorageService;
}

export async function createUser(userManager: UserManager, user: User): Promise<User> {
    if (!user) { throw new Error("invalid_user"); }
    if (!user.username) { throw new Error("invalid_username"); }
    if (!user.password) { throw new Error("invalid_password"); }
    if (await userManager.storage.users.getByIndex("username", user.username)) {
        throw new Error("unavailable_username");
    }

    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.password, salt);
    const pUser = {
        username: user.username,
        passwordHash: hash,
        passwordSalt: salt,
        sessionLifetime: user.sessionLifetime,
        accessLevel: user.accessLevel
    };

    await userManager.storage.users.add(pUser);
    return toUser(pUser);
}

@Injectable({ providedIn: "root" })
export class LocalUsersService implements UsersService, UserManager {
    constructor(
        public storage: IndexedStorageService,
        private errorHandler: ErrorHandlerService
    ) {}

    @RequireAdministrator()
    getUsers(): Observable<User[]> {
        return defer(() => this.storage.users.getAll())
            .pipe(map(pUsers => pUsers.map((u: PersistedUser) => toUser(u))))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    getUser(userId: number): Observable<User> {
        return defer(() => this.storage.users.getByID(userId))
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
            const pUser = await self.storage.users.getByID(user.id);

            pUser.sessionLifetime = user.sessionLifetime;
            pUser.accessLevel = user.accessLevel;
            pUser.token = null;
            pUser.tokenExpiration = null;
            await self.storage.users.update(pUser);

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    @RequireAdministrator()
    deleteUser(user: User): Observable<any> {
        const self = this;
        return defer(async function (): Promise<User> {
            const users = await self.storage.users.getAll();
            if (users.length === 1) {
                throw new Error("delete_user_unavailable");
            }

            if (user.accessLevel === AccessLevel.Administrator &&
                users.filter(u => u.accessLevel === AccessLevel.Readonly).length === 1) {
                throw new Error("delete_user_unavailable");
            }

            await self.storage.users.deleteRecord(user.id);
            return user;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    changePassword(user: User): Observable<User> {
        const self = this;
        return defer(async function(): Promise<User> {
            const pUser = await self.storage.users.getByID(user.id);

            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(user.password, salt);
            pUser.passwordHash = hash;
            pUser.passwordSalt = salt;
            pUser.token = null;
            pUser.tokenExpiration = null;
            await self.storage.users.update(pUser);

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }
}
