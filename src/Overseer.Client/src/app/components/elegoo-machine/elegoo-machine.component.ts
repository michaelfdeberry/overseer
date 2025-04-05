import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18NextPipe } from 'angular-i18next';
import { webCamOrientations } from '../../models/constants';
import { ElegooMachineForm } from '../../models/form.types';
import { ElegooMachine, Machine } from '../../models/machine.model';

@Component({
  selector: 'app-elegoo-machine',
  templateUrl: './elegoo-machine.component.html',
  imports: [ReactiveFormsModule, I18NextPipe],
})
export class ElegooMachineComponent {
  private destroy = inject(DestroyRef);

  webCamOrientations = webCamOrientations;
  machine?: ElegooMachine;
  form?: FormGroup<ElegooMachineForm>;

  constructor() {
    this.destroy.onDestroy(() => {
      if (this.form?.controls['ipAddress']) this.form?.removeControl('ipAddress');
    });
  }

  build(form?: FormGroup<ElegooMachineForm>, machine?: Machine) {
    if (!form) return;

    this.form = form;
    this.machine = machine as ElegooMachine | undefined;

    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('ipAddress', new FormControl(null, Validators.required));

    if (this.machine) {
      this.form.addControl('id', new FormControl(this.machine.id));
      this.form.patchValue({
        name: this.machine.name,
        ipAddress: this.machine.ipAddress,
      });
    }
  }
}
