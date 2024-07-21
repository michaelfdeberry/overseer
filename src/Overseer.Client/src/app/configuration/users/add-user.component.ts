import { Component } from '@angular/core';
import { sessionLifetimes } from '../display-option.type';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './add-user.component.html',
  styleUrls: ['../configuration.scss'],
})
export class AddUserComponent {
  lifetimes = sessionLifetimes;
  form: FormGroup;

  constructor(
    private usersService: UsersService,
    private router: Router,
    formBuilder: FormBuilder,
  ) {
    this.form = formBuilder.group({});
  }

  save() {
    this.form.disable();

    this.usersService.createUser(this.form.value).subscribe({
      complete: () => this.router.navigate(['/configuration/users']),
      error: () => this.form.enable(),
    });
  }
}
