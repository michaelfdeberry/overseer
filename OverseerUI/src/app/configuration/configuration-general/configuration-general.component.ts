import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { AuthenticationService } from "../../shared/authentication.service";
import { ConfigurationService } from "../../shared/configuration.service";

import { pollIntervals } from "../display-option.type";
import { ThemeService } from "../../shared/theme.service";
import { DialogService } from "../../dialogs/dialog.service";

@Component({
    templateUrl: "./configuration-general.component.html",
    styleUrls: [
        "../configuration.scss",
        "./configuration-general.component.scss"
    ]
})
export class ConfigurationGeneralComponent implements OnInit {
    intervals = pollIntervals;
    form: FormGroup;
    users: Array<any>;
    settings: any;
    configuration$: Observable<any>;

    get availableThemes() {
        return this.themeService.themes;
    }

    get currentTheme() {
        return this.themeService.currentTheme;
    }

    constructor(
        private configurationService: ConfigurationService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private formBuilder: FormBuilder,
        private dialog: DialogService,
        private themeService: ThemeService
    ) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            id: [],
            interval: [null, Validators.required],
            localPort: [null, Validators.required],
            hideDisabledPrinters: [null, Validators.required],
            hideIdlePrinters: [null, Validators.required],
            requiresAuthentication: [null, Validators.required]
        });

        this.form.disable();

        this.configuration$ = this.configurationService
            .getSettingsBundle()
            .pipe(tap(configuration => {
                this.users = configuration.users;
                this.settings = configuration.settings;

                this.form.patchValue(configuration.settings);
                this.form.enable();
            }));
    }

    updateTheme(className) {
        this.themeService.applyTheme(className);
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

            this.configurationService
                .updateSettings(this.form.value)
                .subscribe(updatedSettings => {
                    // if user authentication was turned on force the user to log in
                    if (!this.settings.requiresAuthentication && updatedSettings.requiresAuthentication) {
                        this.router.navigate(["/login"]);
                        return;
                    }

                    // if user authentication was turned off logout the user to put the UI in unauthenticated mode
                    if (this.settings.requiresAuthentication && !updatedSettings.requiresAuthentication) {
                        this.authenticationService.logout();
                    }

                    this.settings = updatedSettings;
                    this.form.enable();
                    this.form.markAsPristine();
                });
        }
    }
}
