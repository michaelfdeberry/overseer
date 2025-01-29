import { Component, input, Input, OnInit, output, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { accessLevels, SessionLifetime, sessionLifetimes } from '../../models/constants';
import { CreateUserForm } from '../../models/form.types';
import { AccessLevel } from '../../models/user.model';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    imports: [ReactiveFormsModule, I18NextModule]
})
export class CreateUserComponent implements OnInit {
  accessLevel = input<AccessLevel | undefined>();
  form = input<FormGroup<CreateUserForm>>();

  lifetimes = sessionLifetimes;
  accessLevels = accessLevels;

  ngOnInit(): void {
    const form = this.form();
    if (!form) return;

    const accessLevel = this.accessLevel();
    form.addControl('accessLevel', new FormControl<AccessLevel | undefined>(accessLevel, Validators.required));
    form.addControl('username', new FormControl<string>('', Validators.required));
    form.addControl('password', new FormControl<string>('', [Validators.required, Validators.minLength(8)]));
    form.addControl('confirmPassword', new FormControl<string>('', Validators.required));
    form.addControl('sessionLifetime', new FormControl<SessionLifetime>(undefined));

    if (accessLevel) {
      form.get('accessLevel')?.disable();
    }

    form?.setValidators([
      () => {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
      },
    ]);
  }
}
