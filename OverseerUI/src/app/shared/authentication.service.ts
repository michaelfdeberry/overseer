import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError } from "rxjs/operators";
import { LocalStorageService } from "ngx-store";
import { Observable, of } from "rxjs";
import { endpointFactory } from "./endpoint-factory.function";

@Injectable()
export class AuthenticationService {
    private getEndpoint = endpointFactory("/api/auth");

    public get activeUser() {
        return this.localStorageService.get("activeUser");
    }

    constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

    requiresLogin(): Observable<boolean> {
        return this.http
            .get(this.getEndpoint())
            .pipe(map(() => true))
            .pipe(catchError(() => of(false)));
    }

    login(user) {
        return this.http
            .post<any>(this.getEndpoint("login"), user)
            .pipe(tap(activeUser => this.localStorageService.set("activeUser", activeUser)));
    }

    logout() {
        return this.http
            .delete(this.getEndpoint("logout"))
            .pipe(tap(() => this.localStorageService.clear("all")));
    }

    logoutUser(userId: number) {
        return this.http
        .post(this.getEndpoint("logout", userId), {})
        .pipe(map(user => user));
    }
}
