import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-store";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { User } from "../../models/user.model";
import { AuthenticationService } from "../authentication.service";
import { endpointFactory } from "./endpoint-factory";

@Injectable({ providedIn: "root" })
export class RemoteAuthenticationService implements AuthenticationService {
    private getEndpoint = endpointFactory("/api/auth");

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
            .pipe(tap(activeUser => this.localStorageService.set("activeUser", activeUser)));
    }

    logout(): Observable<Object> {
        return this.http
            .delete(this.getEndpoint("logout"))
            .pipe(tap(() => this.localStorageService.clear("all")));
    }

    logoutUser(userId: number): Observable<Object> {
        return this.http
        .post(this.getEndpoint("logout", userId), {})
        .pipe(map(user => user));
    }

    createInitialUser(user: User): Observable<User> {
        return this.http.put<User>(this.getEndpoint("setup"), user);
    }
}
