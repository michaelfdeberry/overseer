import { Observable } from "rxjs";
import { User } from "../models/user.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export abstract class AuthenticationService {
    abstract readonly activeUser: User;

    abstract requiresLogin(): Observable<boolean>;

    abstract login(user: User): Observable<User>;

    abstract logout(): Observable<Object>;

    abstract logoutUser(userId: number): Observable<Object>;

    abstract createInitialUser(user: User): Observable<User>;
}
