import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({template: "<div style='text-align:center;padding:20px;'>Redirecting...</div>"})
export class SsoComponent implements OnInit {

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    redirectLogin() {
        this.redirect("/login");
    }

    redirectHome() {
        this.redirect("/");
    }

    redirect(path: string) {
        this.router.navigate([path]);
    }

    ngOnInit(): void {
        this.authenticationService.requiresLogin().subscribe((isAuthenticated) => {
            if (isAuthenticated) {
                this.redirectHome();
            } else {
                this.route.queryParamMap.subscribe((params) => {
                    if (params.has("token")) {
                        this.authenticationService
                            .validatePreauthenticatedToken(params.get("token"))
                            .subscribe((user) => {
                                if (user) {
                                    this.redirectHome();
                                }  else {
                                    this.redirectLogin();
                                }
                            });
                    } else {
                        this.redirectLogin();
                    }
                });
            }
        });
    }
}
