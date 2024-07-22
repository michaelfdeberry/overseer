import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseMachineComponent } from './base-machine.component';
import { MachineType } from '../../../models/machine.model';
import { webCamOrientations } from '../../display-option.type';

@Component({
  selector: 'app-octoprint',
  templateUrl: './octoprint-machine.component.html',
  styleUrls: ['../../configuration.scss'],
})
export class OctoprintMachineComponent extends BaseMachineComponent {
  webCamOrientations = webCamOrientations;

  onInit() {
    this.form.addControl('machineType', new FormControl(MachineType.Octoprint));
    this.form.addControl('url', new FormControl(null, Validators.required));
    this.form.addControl('apiKey', new FormControl(null, Validators.required));
    this.form.addControl('clientCertificate', new FormControl());

    if (this.machine) {
      this.form.addControl(
        'profile',
        new FormControl(null, Validators.required),
      );
      this.form.addControl(
        'webCamUrl',
        new FormControl(null, Validators.required),
      );
      this.form.addControl(
        'webCamOrientation',
        new FormControl(null, Validators.required),
      );
      this.form.addControl(
        'snapshotUrl',
        new FormControl(null, Validators.required),
      );
    }
  }

  onDestroy() {
    this.tryRemoveControl(this.form, 'machineType');
    this.tryRemoveControl(this.form, 'url');
    this.tryRemoveControl(this.form, 'apiKey');
    this.tryRemoveControl(this.form, 'profile');
    this.tryRemoveControl(this.form, 'webCamUrl');
    this.tryRemoveControl(this.form, 'snapshotUrl');
    this.tryRemoveControl(this.form, 'clientCertificate');
  }

  compareProfiles(profileA: any, profileB: any): boolean {
    return profileA && profileB && profileA.id === profileB.id;
  }
}
