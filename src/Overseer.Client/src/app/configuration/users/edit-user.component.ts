import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { DialogService } from '../../dialogs/dialog.service';
import { AccessLevel, User } from '../../models/user.model';
import { AuthenticationService } from '../../services/authentication.service';
import { matchValidator } from '../../shared/validators';
import { accessLevels, sessionLifetimes } from '../display-option.type';
import { I18NextService } from 'angular-i18next';

@Component({
  templateUrl: './edit-user.component.html',
  styleUrls: ['../configuration.scss', './edit-user.component.scss'],
})
export class EditUserComponent implements OnInit {
  lifetimes = sessionLifetimes;
  form: FormGroup;
  passwordForm: FormGroup;
  user?: User;
  users?: User[];
  accessLevels = accessLevels;
  generatedUrl?: string;

  get activeUser() {
    return this.authenticationService.activeUser;
  }

  get displayPreauthentication() {
    return (
      this.activeUser.accessLevel === AccessLevel.Administrator &&
      this.user &&
      this.user.accessLevel === AccessLevel.Readonly &&
      this.authenticationService.supportsPreauthentication
    );
  }

  constructor(
    private usersService: UsersService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: DialogService,
    private i18NextService: I18NextService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.formBuilder.group({
      id: [],
      sessionLifetime: [],
      accessLevel: [],
    });

    this.passwordForm = this.formBuilder.group(
      {
        id: [],
        password: [null, [Validators.min(8), Validators.required]],
        confirmPassword: [null, [Validators.required]],
      },
      {
        validator: matchValidator('password', 'confirmPassword'),
      }
    );
  }

  ngOnInit() {
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        const userId = parseInt(params.get('id') ?? '', 10);
        this.usersService.getUsers().subscribe((users: User[]) => {
          this.user = users.find((u: User) => u.id === userId);
          if (!this.user) return;

          this.users = users;
          this.form.patchValue(this.user);
          this.passwordForm.patchValue(this.user);
        });
      })
      .unsubscribe();
  }

  signOut() {
    if (!this.user) return;

    if (this.user.id === this.activeUser.id) {
      this.authenticationService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    } else {
      this.authenticationService.logoutUser(this.user.id!).subscribe((user) => {
        this.user = user;
      });
    }
  }

  delete() {
    if (!this.user) return;
    if (!this.users) return;

    if (this.user.accessLevel === AccessLevel.Administrator && this.users.filter((u) => u.accessLevel === AccessLevel.Administrator).length === 1) {
      this.dialog.alert({
        titleKey: 'warning',
        messageKey: 'requiresAdminPrompt',
      });

      return;
    }

    this.dialog
      .prompt({ messageKey: 'deleteUserPrompt' })
      .afterClosed()
      .subscribe((result) => {
        if (!this.user) return;
        if (!result) return;

        this.handleNetworkAction(this.usersService.deleteUser(this.user));
      });
  }

  save() {
    this.handleNetworkAction(this.usersService.updateUser(this.form.value));
  }

  changePassword() {
    this.handleNetworkAction(this.usersService.changePassword(this.passwordForm.value));
  }

  generatePreAuthentication() {
    if (!this.user) return;

    this.authenticationService.getPreauthenticatedToken(this.user.id!).subscribe((token) => {
      this.generatedUrl = `${window.location.origin}/sso?token=${token}`;
    });
  }

  copyToClipboard(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
    const translation = this.i18NextService.t('copiedToClipboard');
    this.snackBar
      .open(translation, undefined, {
        duration: 3000,
        horizontalPosition: 'right',
      })
      .onAction()
      .subscribe(() => this.snackBar.dismiss());
  }

  private handleNetworkAction(observable: Observable<any>) {
    this.form.disable();
    observable.subscribe(
      () => this.router.navigate(['/configuration/users']),
      () => this.form.enable()
    );
  }
}
