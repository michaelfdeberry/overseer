import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { AuthenticationService } from "../services/authentication.service";
import { User } from "../models/user.model";
import { Observable } from "rxjs";

@Component({
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    form: FormGroup;

    constructor(
        private authenticationService: AuthenticationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required]
        });

        this.route.queryParamMap.subscribe(params => {
            if (params.has("sso")) {
                this.handleAuthenticationResult(this.authenticationService.validatePreauthenticatedToken(params.get("sso")));
            }
        });
    }

    signIn() {
        this.form.disable();

        this.handleAuthenticationResult(this.authenticationService.login(this.form.value));
    }

    handleAuthenticationResult(userObservable: Observable<User>) {
        userObservable.subscribe(
            () => this.router.navigate(["/"]),
            () => this.form.enable()
        );
    }
}
