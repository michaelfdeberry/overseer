import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [
    MatToolbar,
    MatToolbarRow,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
  ],
})
export class NavigationComponent {
  get showMenu() {
    return !!this.authenticationService.activeUser;
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  logout() {
    this.authenticationService
      .logout()
      .subscribe(() => this.router.navigate(['/login']));
  }
}
