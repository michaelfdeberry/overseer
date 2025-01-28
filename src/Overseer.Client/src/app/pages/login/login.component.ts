import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { UnauthenticatedComponent } from '../../components/unauthenticated/unauthenticated.component';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [UnauthenticatedComponent, I18NextModule, ReactiveFormsModule]
})
export class LoginComponent {
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  login() {
    if (!this.form.valid) return;
    if (!this.form.value.username) return;
    if (!this.form.value.password) return;

    this.form.disable();
    this.authenticationService
      .login({
        username: this.form.value.username,
        password: this.form.value.password,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.form.enable(),
      });
  }
}
