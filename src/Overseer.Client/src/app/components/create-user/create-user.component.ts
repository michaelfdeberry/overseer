import { Component, input, Input, OnInit, output, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { accessLevels, sessionLifetimes } from '../../models/constants';
import { CreateUserForm } from '../../models/form.types';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, I18NextModule],
})
export class CreateUserComponent implements OnInit {
  form = input<FormGroup<CreateUserForm>>();

  lifetimes = sessionLifetimes;
  accessLevels = accessLevels;

  ngOnInit(): void {
    const form = this.form();
    if (!form) return;

    form.addControl('username', new FormControl(null, Validators.required));
    form.addControl('password', new FormControl(null, [Validators.required, Validators.minLength(8)]));
    form.addControl('confirmPassword', new FormControl(null, Validators.required));
    form.addControl('sessionLifetime', new FormControl(null));
    form.addControl('accessLevel', new FormControl(null, Validators.required));

    form?.setValidators([
      () => {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
      },
    ]);
  }
}
