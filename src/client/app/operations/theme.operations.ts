import { defaultTheme } from '../components/layout/themes';

export function getCurrentTheme(): string {
  return localStorage.getItem('current_theme') || defaultTheme;
}

export function setCurrentTheme(themeName: string): void {
  localStorage.setItem('current_theme', themeName);
}
