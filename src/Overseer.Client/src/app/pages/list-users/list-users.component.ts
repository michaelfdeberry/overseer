import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { User } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  standalone: true,
  imports: [I18NextModule, RouterLink],
})
export class ListUsersComponent {
  private usersService = inject(UsersService);
  users = signal<User[]>([]);

  constructor() {
    this.usersService.getUsers().subscribe((users) => this.users.set(users));
  }
}
