import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { CreateUserComponent } from '../../components/create-user/create-user.component';
import { CreateUserForm } from '../../models/form.types';
import { User } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  standalone: true,
  imports: [I18NextModule, ReactiveFormsModule, RouterLink, CreateUserComponent],
})
export class AddUserComponent {
  private builder = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  form: FormGroup<CreateUserForm> = this.builder.group({});

  save(): void {
    this.form.disable();
    this.usersService.createUser(this.form.getRawValue() as User).subscribe(() => this.router.navigate(['settings', 'users']));
  }
}
