import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { tap } from 'rxjs/operators';

import { pollIntervals } from '../display-option.type';
import { SettingsService } from '../../services/settings.service';

@Component({
  templateUrl: './general-settings.component.html',
  styleUrls: ['../configuration.scss', './general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit {
  intervals = pollIntervals;
  form!: UntypedFormGroup;
  settings: any;

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      id: [],
      interval: [null, Validators.required],
      hideDisabledMachines: [null, Validators.required],
      hideIdleMachines: [null, Validators.required],
      sortByTimeRemaining: [null, Validators.required],
    });

    this.form.disable();
    this.settingsService
      .getSettings()
      .pipe(
        tap((settings) => {
          this.settings = settings;

          this.form.patchValue(settings);
          this.form.enable();
        })
      )
      .subscribe();
  }

  cancel() {
    this.form.patchValue(this.settings);
    this.form.markAsPristine();
  }

  save() {
    this.form.disable();
    this.settingsService.updateSettings(this.form.value).subscribe((updatedSettings) => {
      this.settings = updatedSettings;
      this.form.enable();
      this.form.markAsPristine();
    });
  }
}
