import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthenticationService } from "../shared/authentication.service";

@Component({
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    form: FormGroup;

    constructor(
        private authenticationService: AuthenticationService,
        private formBuilder: FormBuilder,
        private router: Router
    ) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required]
        });
    }

    signIn() {
        this.form.disable();

        this.authenticationService.login(this.form.value)
            .subscribe(
                () => this.router.navigate(["/"]),
                () => this.form.enable()
            );
    }
}
