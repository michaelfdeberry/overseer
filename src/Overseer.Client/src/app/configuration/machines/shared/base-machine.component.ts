import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Machine } from '../../../models/machine.model';

export function machineFormFactory(builder: UntypedFormBuilder, controls?: Record<string, UntypedFormControl>) {
  const form = builder.group({
    machineType: [null, []],
    name: [null, [Validators.required]],
  });

  if (controls) {
    Object.keys(controls).forEach((key) => {
      const control: UntypedFormControl = controls[key];
      form.addControl(key, control);
    });
  }

  return form;
}

@Directive()
export abstract class BaseMachineComponent implements OnInit, OnDestroy {
  @Input()
  machine?: Machine;

  @Input()
  form!: UntypedFormGroup;

  @Input()
  enableAdvancedSettings!: boolean;

  advancedSettingsVisible = false;

  abstract onInit(): void;

  abstract onDestroy(): void;

  ngOnInit() {
    this.form.addControl('name', new UntypedFormControl(null, Validators.required));

    this.onInit();

    if (this.machine) {
      this.form.addControl('id', new UntypedFormControl());
      this.form.patchValue(this.machine);
    }
  }

  ngOnDestroy() {
    this.tryRemoveControl(this.form, 'id');
    this.tryRemoveControl(this.form, 'name');

    this.onDestroy();
  }

  tryRemoveControl(form: UntypedFormGroup, name: string) {
    if (form && form.controls[name]) {
      form.removeControl(name);
    }
  }
}
