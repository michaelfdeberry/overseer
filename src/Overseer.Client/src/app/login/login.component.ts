import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  templateUrl: './login.component.html',
  standalone: true,
  imports: [MatCard, MatFormField, MatCard, MatCardContent, MatCardActions, I18NextModule, ReactiveFormsModule, MatInput, MatButton, MatLabel],
})
export class LoginComponent {
  form: UntypedFormGroup;

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: UntypedFormBuilder,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
    });
  }

  signIn() {
    if (!this.form) return;

    this.form.disable();
    this.authenticationService.login(this.form.value).subscribe({
      complete: () => this.router.navigate(['/']),
      error: () => this.form?.enable(),
    });
  }
}
