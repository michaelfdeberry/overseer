import { Observable, Subject } from "rxjs";
import { User } from "../models/user.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export abstract class AuthenticationService {
    readonly authenticationChangeEvent$: Subject<User>;

    abstract readonly supportsPreauthentication: boolean;

    abstract readonly activeUser: User;

    abstract requiresLogin(): Observable<boolean>;

    abstract login(user: User): Observable<User>;

    abstract logout(): Observable<Object>;

    abstract logoutUser(userId: number): Observable<User>;

    abstract createInitialUser(user: User): Observable<User>;

    abstract getPreauthenticatedToken(userId: number): Observable<string>;

    abstract validatePreauthenticatedToken(token: string): Observable<User>;
}
