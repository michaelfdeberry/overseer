import { Component } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-navigation",
    templateUrl: "./navigation.component.html",
    styleUrls: ["./navigation.component.scss"]
})
export class NavigationComponent {
    get showMenu() {
        return !!this.authenticationService.activeUser;
    }

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    logout() {
        this.authenticationService
            .logout()
            .subscribe(() => this.router.navigate(["/login"]));
    }
}
