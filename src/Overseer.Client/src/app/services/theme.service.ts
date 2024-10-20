import { effect, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = signal<string | undefined>(undefined);
  scheme = signal<'auto' | 'dark' | 'light'>('auto');

  constructor(private localStorage: LocalStorageService) {
    this.theme.set(this.localStorage.get('theme'));
    this.scheme.set(this.localStorage.get('scheme') || 'auto');

    effect(() => {
      this.localStorage.set('theme', this.theme());
      this.localStorage.set('scheme', this.scheme());
    });
  }
}
