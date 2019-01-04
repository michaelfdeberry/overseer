import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import * as bcrypt from "bcryptjs";
import { LocalStorageService } from "ngx-store";
import { defer, Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";

import { isTokenExpired, toUser, User } from "../../models/user.model";
import { AuthenticationService } from "../authentication.service";
import { UserStorageService } from "./storage/user-storage.service";
import { createUser, UserManager } from "./users.service";
import { ErrorHandlerService } from "../error-handler.service";

@Injectable({ providedIn: "root" })
export class LocalAuthenticationService implements AuthenticationService, UserManager {
    constructor(
        public userStorage: UserStorageService,
        private localStorageService: LocalStorageService,
        private router: Router,
        private errorHandler: ErrorHandlerService
    ) {}

    get activeUser(): User {
        return this.localStorageService.get("activeUser");
    }

    requiresLogin(): Observable<boolean> {
        const self = this;
        return defer(async function(): Promise<boolean> {
            const userCount = await self.userStorage.getUserCount();
            if (!userCount) {
                self.router.navigate(["/configuration", "setup"]);
                return false;
            }

            if (!self.localStorageService.get("activeUser")) {
                self.router.navigate(["/login"]);
                return false;
            }

            return true;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    login(user: User): Observable<User> {
        const self = this;
        return defer(async function() {
            if (!user.username) { throw new Error("invalid_username"); }
            if (!user.password) { throw new Error("invalid_password"); }

            const pUser = await self.userStorage.getUserByUsername(user.username);
            if (!pUser) { throw new Error("invalid_username"); }

            const hash = bcrypt.hashSync(user.password, pUser.passwordSalt);
            if (hash !== pUser.passwordHash) { throw new Error("invalid_password"); }

            if (isTokenExpired(pUser)) {
                // TODO: determine if this would be referenced anywhere other
                // than the http interceptor when making service request.
                // I have a feeling this token is pretty useless for the local app.
                pUser.token = bcrypt.genSaltSync(16);
                if (user.sessionLifetime) {
                    pUser.tokenExpiration = Date.now() + (user.sessionLifetime * 86400);
                } else {
                    pUser.tokenExpiration = null;
                }
            }

            await self.userStorage.updateUser(pUser);
            self.localStorageService.set("activeUser", toUser(pUser, true));
            return self.activeUser;
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    logout(): Observable<Object> {
        return this.logoutUser(this.activeUser.id).pipe(tap(() => {
            this.localStorageService.remove("activeUser");
        }))
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    logoutUser(userId: number): Observable<Object> {
        const self = this;
        return defer(async function() {
            const pUser = await self.userStorage.getUserById(userId);
            pUser.token = null;
            pUser.tokenExpiration = null;

            return toUser(pUser);
        })
            .pipe(catchError(err => this.errorHandler.handle(err)));
    }

    createInitialUser(user: User): Observable<User> {
        return defer(() => createUser(this, user)).pipe(catchError(err => this.errorHandler.handle(err)));
    }
}
