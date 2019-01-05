import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { matchValidator } from "../../shared/validators";
import { sessionLifetimes } from "../display-option.type";

@Component({
    selector: "app-create-user",
    templateUrl: "./create-user.component.html"
})
export class CreateUserComponent implements OnInit {
    @Input()
    form: FormGroup;

    lifetimes = sessionLifetimes;

    ngOnInit(): void {
        this.form.addControl("username", new FormControl(null, Validators.required));
        this.form.addControl("password", new FormControl(null, [Validators.required, Validators.minLength(8)]));
        this.form.addControl("confirmPassword", new FormControl(null, Validators.required));
        this.form.addControl("sessionLifetime", new FormControl(null));

        this.form.setValidators(matchValidator("password", "confirmPassword"));
    }
}
