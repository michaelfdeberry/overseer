import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorage } from "ngx-store";
import { Observable } from "rxjs";

import { sessionLifetimes } from "../display-option.type";
import { AuthenticationService } from "../../services/authentication.service";
import { DialogService } from "../../dialogs/dialog.service";
import { matchValidator } from "../../shared/validators";
import { SettingsService } from "src/app/services/settings.service";
import { UsersService } from "src/app/services/users.service";
import { User, AccessLevel } from "../../models/user.model";
import { ApplicationSettings } from "../../models/settings.model";

@Component({
    templateUrl: "./edit-user.component.html",
    styleUrls: [
        "../configuration.scss",
        "./edit-user.component.scss"
    ]
})
export class EditUserComponent implements OnInit {
    lifetimes = sessionLifetimes;
    form: FormGroup;

    @LocalStorage() activeUser: any;
    user: User;
    users: User[];
    settings: ApplicationSettings;

    constructor(
        private usersService: UsersService,
        private settingsService: SettingsService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dialog: DialogService
    ) {
        this.form = this.formBuilder.group({
            id: [],
            password: [null, [Validators.min(8)]],
            confirmPassword: [],
            sessionLifetime: []
        }, {
            validator: matchValidator("password", "confirmPassword")
        });
    }

    ngOnInit() {
        this.route.paramMap
            .subscribe((params: ParamMap) => {
                this.settingsService.getConfigurationBundle().subscribe(bundle => {
                    this.settings = bundle.settings;
                    this.users = bundle.users;

                    const userId = parseInt(params.get("id"), 10);
                    this.user = Object.assign({}, this.users.find(u => u.id === userId));

                    this.form.patchValue(this.user);
                });
            })
            .unsubscribe();
    }

    signOut() {
        if (this.user.id === this.activeUser.id) {
            this.authenticationService.logout().subscribe(() => {
                this.router.navigate(["/login"]);
            });
        } else {
            this.authenticationService.logoutUser(this.user.id).subscribe(user => {
                this.user = user;
            });
        }
    }

    delete() {
        if (this.user.accessLevel === AccessLevel.Administrator &&
            this.users.filter(u => u.accessLevel === AccessLevel.Administrator).length === 1) {

            this.dialog.alert({
                titleKey: "warning",
                messageKey: "requiresAdminPrompt"
            });

            return;
        }

        this.dialog.prompt({ messageKey: "deleteUserPrompt" })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.handleNetworkAction(this.usersService.deleteUser(this.user));
                }
            });
    }

    save() {
        this.handleNetworkAction(this.usersService.updateUser(this.form.value));
    }

    private handleNetworkAction(observable: Observable<any>) {
        this.form.disable();
        observable.subscribe(
            () => this.router.navigate(["/configuration/users"]),
            () => this.form.enable()
        );
    }
}
