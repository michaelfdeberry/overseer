import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from 'ngx-store';
import { HttpClient } from '@angular/common/http';

export interface ThemeUpdate {
  current: string;
  previous?: string;
}

export interface Theme {
  name: string;
  primaryColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themes?: Theme[];
  theme$: BehaviorSubject<ThemeUpdate>;

  get currentTheme(): string {
    return this.localStorage.get('currentTheme');
  }

  set currentTheme(value: string) {
    this.localStorage.set('currentTheme', value);
  }

  get primaryColor() {
    if (!this.themes) {
      return '#fff';
    }

    const theme = this.themes.find((t) => t.name === this.currentTheme);
    if (theme) {
      return theme.primaryColor;
    }

    return this.themes.find((t) => t.name === 'default-theme')!.primaryColor;
  }

  constructor(
    private localStorage: LocalStorageService,
    http: HttpClient,
  ) {
    http
      .get<Theme[]>('/themes.json')
      .subscribe((themes) => (this.themes = themes));

    const theme = this.currentTheme || 'default-theme';
    this.theme$ = new BehaviorSubject<ThemeUpdate>({
      current: theme,
    });

    this.currentTheme = theme;
  }

  applyTheme(themeClassName: string) {
    this.theme$.next({
      current: themeClassName,
      previous: this.currentTheme,
    });

    this.currentTheme = themeClassName;
  }
}
