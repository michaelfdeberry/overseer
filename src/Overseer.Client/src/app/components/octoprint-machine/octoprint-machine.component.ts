import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';
import { webCamOrientations } from '../../models/constants';
import { OctoprintMachineForm } from '../../models/form.types';
import { Machine, MachineType } from '../../models/machine.model';
import { MachinesService } from '../../services/machines.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-octoprint',
  templateUrl: './octoprint-machine.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgbCollapseModule, I18NextModule, NgIf],
})
export class OctoprintMachineComponent {
  private destroy = inject(DestroyRef);

  advancedOptionsVisible = false;
  webCamOrientations = webCamOrientations;
  machinesService = inject(MachinesService);
  machine?: Machine;
  form?: FormGroup<OctoprintMachineForm>;

  constructor() {
    this.destroy.onDestroy(() => {
      if (this.form?.controls['url']) this.form?.removeControl('url');
      if (this.form?.controls['apiKey']) this.form?.removeControl('apiKey');
      if (this.form?.controls['profile']) this.form?.removeControl('profile');
      if (this.form?.controls['webCamUrl']) this.form?.removeControl('webCamUrl');
      if (this.form?.controls['webCamOrientation']) this.form?.removeControl('webCamOrientation');
      if (this.form?.controls['clientCertificate']) this.form?.removeControl('clientCertificate');
    });
  }

  build(form?: FormGroup<OctoprintMachineForm>, machine?: Machine) {
    if (!form) return;

    this.form = form;
    this.machine = machine;

    this.form.addControl('name', new FormControl(null, Validators.required));
    this.form.addControl('url', new FormControl(null, Validators.required));
    this.form.addControl('apiKey', new FormControl(null, Validators.required));
    this.form.addControl('clientCertificate', new FormControl());

    if (this.machine) {
      this.form.addControl('id', new FormControl(null));
      this.form.addControl('profile', new FormControl(null, Validators.required));
      this.form.addControl('webCamUrl', new FormControl(null, Validators.required));
      this.form.addControl('webCamOrientation', new FormControl(null, Validators.required));

      this.form.patchValue({
        name: this.machine.name,
        url: this.machine.url,
        apiKey: this.machine.apiKey,
        profile: this.machine.profile,
        webCamUrl: this.machine.webCamUrl,
        webCamOrientation: this.machine.webCamOrientation,
      });
    }
  }

  compareProfiles(profileA: any, profileB: any): boolean {
    return profileA && profileB && profileA.id === profileB.id;
  }
}
