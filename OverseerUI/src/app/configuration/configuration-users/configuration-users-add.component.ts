import { Component, OnInit } from "@angular/core";
import { sessionLifetimes } from "../display-option.type";
import { ConfigurationService } from "../../shared/configuration.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { matchValidator } from "../../shared/validators";

@Component({
    templateUrl: "./configuration-users-add.component.html",
    styleUrls: [
        "../configuration.scss"
    ]
})
export class ConfigurationUsersAddComponent implements OnInit {
    lifetimes = sessionLifetimes;
    form: FormGroup;

    constructor(
        private configurationService: ConfigurationService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, [Validators.required, Validators.minLength(8)]],
            confirmPassword: [null, Validators.required],
            sessionLifetime: []
        }, {
            validator: matchValidator("password", "confirmPassword")
        });
    }

    save() {
        this.form.disable();

        this.configurationService.createUser(this.form.value)
            .subscribe(
                createdUser => this.router.navigate(["/configuration/users"]),
                () => this.form.enable()
            );
    }
}
