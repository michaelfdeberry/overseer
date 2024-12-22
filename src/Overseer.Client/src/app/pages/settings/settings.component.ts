import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { defaultPollInterval, pollIntervals } from '../../models/constants';
import { ApplicationSettings } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';
import { ToastsService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, I18NextModule, FormsModule],
})
export class SettingsComponent {
  intervals = pollIntervals;
  themeService = inject(ThemeService);
  private formBuilder = inject(FormBuilder);
  private toastsService = inject(ToastsService);
  private settingsService = inject(SettingsService);

  form?: FormGroup<{
    interval: FormControl<number>;
    hideDisabledMachines: FormControl<boolean>;
    hideIdleMachines: FormControl<boolean>;
    sortByTimeRemaining: FormControl<boolean>;
  }>;

  constructor() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.form = this.formBuilder.nonNullable.group({
        interval: settings.interval ?? defaultPollInterval,
        hideDisabledMachines: settings.hideDisabledMachines ?? false,
        hideIdleMachines: settings.hideIdleMachines ?? false,
        sortByTimeRemaining: settings.sortByTimeRemaining ?? false,
      });

      this.form.valueChanges.subscribe(() => {
        this.settingsService.updateSettings(this.form!.value as ApplicationSettings).subscribe(() => this.updateComplete());
      });
    });
  }

  updateComplete(): void {
    this.toastsService.show({
      delay: 1000,
      type: 'success',
      message: 'savedChanges',
    });
  }

  handleSchemeChange(scheme: string): void {
    if (!['auto', 'light', 'dark'].includes(scheme)) return;
    this.themeService.scheme.set(scheme as 'auto' | 'light' | 'dark');
    this.updateComplete();
  }

  handleThemeChange(theme: string): void {
    this.themeService.theme.set(theme);
    this.updateComplete();
  }
}
