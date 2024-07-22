import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MachinesService } from '../../services/machines.service';
import { machineTypes } from '../display-option.type';
import { CertificateErrorService } from './certificate-error.service';
import { machineFormFactory } from './shared/base-machine.component';

@Component({
  templateUrl: './add-machine.component.html',
  styleUrls: ['../configuration.scss'],
})
export class AddMachineComponent {
  form: UntypedFormGroup;

  machineTypes = machineTypes;

  constructor(
    private router: Router,
    private machinesService: MachinesService,
    private certificateErrorService: CertificateErrorService,
    formBuilder: UntypedFormBuilder,
  ) {
    this.form = machineFormFactory(formBuilder);
  }

  save() {
    this.machinesService.createMachine(this.form.value).subscribe({
      complete: () => this.router.navigate(['/configuration/machines']),
      error: (ex) => {
        this.form.enable();
        this.certificateErrorService
          .handleCertificateException(ex)
          .subscribe((exceptionAdded) => {
            if (exceptionAdded) {
              this.save();
            }
          });
      },
    });
  }
}
