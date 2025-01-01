import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';
import { webCamOrientations } from '../../models/constants';
import { BambuMachineForm, RepRapMachineForm } from '../../models/form.types';
import { BambuMachine, Machine } from '../../models/machine.model';

@Component({
  selector: 'app-bambu-machine',
  templateUrl: './bambu-machine.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, I18NextModule, NgbCollapseModule],
})
export class BambuMachineComponent {
  private destroy = inject(DestroyRef);

  webCamOrientations = webCamOrientations;
  machine?: BambuMachine;
  form?: FormGroup<BambuMachineForm>;

  constructor() {
    this.destroy.onDestroy(() => {
      if (this.form?.controls['url']) this.form?.removeControl('url');
      if (this.form?.controls['accessCode']) this.form?.removeControl('accessCode');
      if (this.form?.controls['serial']) this.form?.removeControl('serial');
    });
  }

  build(form?: FormGroup<RepRapMachineForm>, machine?: Machine) {
    if (!form) return;

    this.form = form;
    this.machine = machine as BambuMachine | undefined;

    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('url', new FormControl(null, Validators.required));
    this.form.addControl('accessCode', new FormControl(null, Validators.required));
    this.form.addControl('serial', new FormControl(null, Validators.required));

    if (this.machine) {
      this.form.addControl('id', new FormControl(this.machine.id));
      this.form.patchValue({
        name: this.machine.name,
        url: this.machine.url,
        accessCode: this.machine.accessCode,
        serial: this.machine.serial,
      });
    }
  }
}
