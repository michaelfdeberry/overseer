import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-store";
import { Observable, of, Subject } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { User } from "../../models/user.model";
import { AuthenticationService } from "../authentication.service";
import { endpointFactory } from "./endpoint-factory";

@Injectable({ providedIn: "root" })
export class RemoteAuthenticationService implements AuthenticationService {
    public readonly authenticationChangeEvent$ = new Subject<User>();

    private getEndpoint = endpointFactory("/api/auth");

    supportsPreauthentication = true;

    get activeUser(): User {
        return this.localStorageService.get("activeUser");
    }

    constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

    requiresLogin(): Observable<boolean> {
        return this.http
            .get(this.getEndpoint())
            .pipe(map(() => true))
            .pipe(catchError(() => of(false)));
    }

    login(user: User): Observable<User> {
        return this.http
            .post<User>(this.getEndpoint("login"), user)
            .pipe(tap(activeUser => this.completeAuthentication(activeUser)));
    }

    logout(): Observable<Object> {
        return this.http
            .delete(this.getEndpoint("logout"))
            .pipe(tap(() => {
                this.localStorageService.clear("all");
                this.authenticationChangeEvent$.next(null);
            }));
    }

    logoutUser(userId: number): Observable<User> {
        return this.http.post<User>(this.getEndpoint("logout", userId), {});
    }

    createInitialUser(user: User): Observable<User> {
        return this.http.put<User>(this.getEndpoint("setup"), user);
    }

    getPreauthenticatedToken(userId: number): Observable<string> {
        return this.http.get(this.getEndpoint("sso", userId), { responseType: "text" });
    }

    validatePreauthenticatedToken(token: string): Observable<User> {
        return this.http
            .post<User>(this.getEndpoint("sso"), token)
            .pipe(tap(activeUser => this.completeAuthentication(activeUser)));
    }

    private completeAuthentication(activeUser: User) {
        this.localStorageService.set("activeUser", activeUser);
        this.authenticationChangeEvent$.next(activeUser);
    }
}
