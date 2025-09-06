import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18NextPipe } from 'angular-i18next';
import { webCamOrientations } from '../../models/constants';
import { MoonrakerMachineForm } from '../../models/form.types';
import { Machine, MoonrakerMachine } from '../../models/machine.model';

@Component({
  selector: 'app-moonraker-machine',
  templateUrl: './moonraker-machine.component.html',
  imports: [ReactiveFormsModule, I18NextPipe, CommonModule],
})
export class MoonrakerMachineComponent {
  private destroy = inject(DestroyRef);

  webCamOrientations = webCamOrientations;
  machine?: MoonrakerMachine;
  form?: FormGroup<MoonrakerMachineForm>;

  constructor() {
    this.destroy.onDestroy(() => {
      if (this.form?.controls['ipAddress']) this.form?.removeControl('ipAddress');
      if (this.form?.controls['webCamUrl']) this.form?.removeControl('webCamUrl');
      if (this.form?.controls['webCamOrientation']) this.form?.removeControl('webCamOrientation');
      if (this.form?.controls['clientCertificate']) this.form?.removeControl('clientCertificate');
    });
  }

  build(form?: FormGroup<MoonrakerMachineForm>, machine?: Machine) {
    if (!form) return;

    this.form = form;
    this.machine = machine as MoonrakerMachine;

    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('ipAddress', new FormControl(null, Validators.required));
    this.form.addControl('clientCertificate', new FormControl());

    if (this.machine) {
      const moonrakerMachine = this.machine as MoonrakerMachine;
      this.form.addControl('id', new FormControl(null));
      this.form.addControl('webCamUrl', new FormControl(moonrakerMachine.webCamUrl));
      this.form.addControl('webCamOrientation', new FormControl(null, Validators.required));
      this.form.controls['ipAddress']?.disable();

      this.form.patchValue({
        name: this.machine.name,
        ipAddress: this.machine.ipAddress,
        webCamOrientation: this.machine.webCamOrientation,
        availableWebCams: this.machine.availableWebCams,
      });
    }
  }
}
