import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbar, MatToolbarRow, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, I18NextModule, RouterLink],
})
export class NavigationComponent {
  get showMenu() {
    return !!this.authenticationService.activeUser;
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
