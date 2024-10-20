import { Component, computed, effect, inject, Renderer2, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressHttp } from 'ngx-progressbar/http';
import { SvgComponent } from './components/svg/svg.component';
import { AuthenticationService } from './services/authentication.service';
import { ThemeService } from './services/theme.service';
import { ToastsComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgProgressbar, NgProgressHttp, SvgComponent, I18NextModule, RouterLink, RouterLinkActive, ToastsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private themeService = inject(ThemeService);
  private authenticationService = inject(AuthenticationService);

  isLoggedIn = computed(() => !!this.authenticationService.activeUser());

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();
      let scheme = this.themeService.scheme();

      if (scheme === 'auto') {
        scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      this.renderer.setAttribute(window.document.body, 'data-bs-theme', scheme);

      if (theme) {
        this.renderer.removeClass(window.document.body, theme);
      }
    });
  }

  setLight(): void {
    this.themeService.scheme.set('light');
  }

  setDark(): void {
    this.themeService.scheme.set('dark');
  }

  setAuto(): void {
    this.themeService.scheme.set('auto');
  }

  logout(): void {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
