import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";
import { AccessLevel } from "../models/user.model";

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authenticationService.requiresLogin();
    }
}

@Injectable()
export class AccessLevelGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.authenticationService.activeUser;
        return user && user.accessLevel === AccessLevel.Administrator;
    }
}
