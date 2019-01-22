import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { pollIntervals } from "../display-option.type";
import { DialogService } from "../../dialogs/dialog.service";
import { SettingsService } from "../../services/settings.service";

@Component({
    templateUrl: "./general-settings.component.html",
    styleUrls: [
        "../configuration.scss",
        "./general-settings.component.scss"
    ]
})
export class GeneralSettingsComponent implements OnInit {
    intervals = pollIntervals;
    form: FormGroup;
    clientForm: FormGroup;
    users: Array<any>;
    settings: any;
    configuration$: Observable<any>;

    constructor(
        private settingsService: SettingsService,
        private router: Router,
        private formBuilder: FormBuilder,
        private dialog: DialogService
    ) {}

    ngOnInit() {
        this.clientForm = this.formBuilder.group({});

        this.form = this.formBuilder.group({
            id: [],
            interval: [null, Validators.required],
            hideDisabledMachines: [null, Validators.required],
            hideIdleMachines: [null, Validators.required]
        });

        this.form.disable();

        this.configuration$ = this.settingsService
            .getConfigurationBundle()
            .pipe(tap(configuration => {
                this.users = configuration.users;
                this.settings = configuration.settings;

                this.form.patchValue(configuration.settings);
                this.form.enable();
            }));
    }

    cancel() {
        this.form.patchValue(this.settings);
        this.form.markAsPristine();
    }

    save() {
        if (this.form.value.requiresAuthentication && !this.users.length) {
            this.dialog.prompt({
                messageKey: "requiresAuthenticationPrompt",
                positiveActionTextKey: "addUser",
                negativeActionTextKey: "cancel"
            })
                .afterClosed()
                .subscribe(displayUsers => {
                    if (displayUsers) {
                        this.router.navigate(["/configuration/users/add"]);
                    } else {
                        this.cancel();
                    }
                });
        } else {
            this.form.disable();

            this.settingsService
                .updateSettings(this.form.value)
                .subscribe(updatedSettings => {
                    this.settings = updatedSettings;
                    this.form.enable();
                    this.form.markAsPristine();
                });
        }
    }
}
