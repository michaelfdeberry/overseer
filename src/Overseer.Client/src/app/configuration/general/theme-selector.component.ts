import { Component, Input } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector-component.html',
})
export class ThemeSelectorComponent {
  @Input()
  form!: UntypedFormGroup;

  get availableThemes() {
    return this.themeService.themes;
  }

  get currentTheme() {
    return this.themeService.currentTheme;
  }

  constructor(private themeService: ThemeService) {}

  updateTheme(className: string) {
    this.themeService.applyTheme(className);
  }
}
