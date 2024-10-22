import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';
import { machineTypes, webCamOrientations } from '../../models/constants';
import { RepRapMachineForm } from '../../models/form.types';
import { Machine, MachineType } from '../../models/machine.model';
import { MachinesService } from '../../services/machines.service';

@Component({
  selector: 'app-reprap-firmware-machine',
  templateUrl: './reprapfirmware-machine.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, I18NextModule, NgbCollapseModule],
})
export class RepRapFirmwareMachineComponent {
  private destroy = inject(DestroyRef);

  machineTypes = machineTypes;
  advancedOptionsVisible = false;
  machinesService = inject(MachinesService);
  webCamOrientations = webCamOrientations;
  machine?: Machine;
  form?: FormGroup<RepRapMachineForm>;

  constructor() {
    this.destroy.onDestroy(() => {
      if (this.form?.controls['url']) this.form?.removeControl('url');
      if (this.form?.controls['webCamUrl']) this.form?.removeControl('webCamUrl');
      if (this.form?.controls['webCamOrientation']) this.form?.removeControl('webCamOrientation');
      if (this.form?.controls['clientCertificate']) this.form?.removeControl('clientCertificate');
    });
  }

  build(form?: FormGroup<RepRapMachineForm>, machine?: Machine) {
    if (!form) return;

    this.form = form;
    this.machine = machine;

    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('url', new FormControl(null, Validators.required));
    this.form.addControl('webCamUrl', new FormControl(null, Validators.required));
    this.form.addControl('webCamOrientation', new FormControl(null, Validators.required));
    this.form.addControl('clientCertificate', new FormControl());

    if (this.machine) {
      this.form.addControl('id', new FormControl(this.machine.id));
      this.form.patchValue({
        name: this.machine.name,
        url: this.machine.url,
        webCamUrl: this.machine.webCamUrl,
        webCamOrientation: this.machine.webCamOrientation,
      });
    }
  }
}
