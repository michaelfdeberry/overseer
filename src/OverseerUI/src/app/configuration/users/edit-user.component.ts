import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Observable } from "rxjs";

import { sessionLifetimes, accessLevels } from "../display-option.type";
import { AuthenticationService } from "../../services/authentication.service";
import { DialogService } from "../../dialogs/dialog.service";
import { matchValidator } from "../../shared/validators";
import { UsersService } from "src/app/services/users.service";
import { User, AccessLevel } from "../../models/user.model";

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
    passwordForm: FormGroup;
    user: User;
    users: User[];
    accessLevels = accessLevels;
    generatedUrl: string;

    get activeUser() {
        return this.authenticationService.activeUser;
    }

    get displayPreauthentication() {
        return this.activeUser.accessLevel === AccessLevel.Administrator &&
            this.user && this.user.accessLevel === AccessLevel.Readonly &&
            this.authenticationService.supportsPreauthentication;
    }

    constructor(
        private usersService: UsersService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dialog: DialogService
    ) {
        this.form = this.formBuilder.group({
            id: [],
            sessionLifetime: [],
            accessLevel: [],
        });

        this.passwordForm = this.formBuilder.group({
            id: [],
            password: [null, [Validators.min(8), Validators.required]],
            confirmPassword: [null, [Validators.required]],
        }, {
            validator: matchValidator("password", "confirmPassword")
        });
    }

    ngOnInit() {
        this.route.paramMap
            .subscribe((params: ParamMap) => {
                const userId = parseInt(params.get("id"), 10);
                this.usersService.getUsers().subscribe(users => {
                    this.user = users.find(u => u.id === userId);
                    this.users = users;
                    this.form.patchValue(this.user);
                    this.passwordForm.patchValue(this.user);
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

    changePassword() {
        this.handleNetworkAction(this.usersService.changePassword(this.passwordForm.value));
    }

    generatePreAuthentication() {
        this.authenticationService.getPreauthenticatedToken(this.user.id).subscribe(token => {
            this.generatedUrl = `${window.location.origin}/login?sso=${token}`;
        });
    }

    private handleNetworkAction(observable: Observable<any>) {
        this.form.disable();
        observable.subscribe(
            () => this.router.navigate(["/configuration/users"]),
            () => this.form.enable()
        );
    }
}
