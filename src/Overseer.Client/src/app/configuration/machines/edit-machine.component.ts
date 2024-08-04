import { Component } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subscription, Observable, take } from 'rxjs';

import { DialogService } from '../../dialogs/dialog.service';
import { CertificateErrorService } from './certificate-error.service';
import { machineFormFactory } from './shared/base-machine.component';
import { MachinesService } from '../../services/machines.service';
import { Machine } from '../../models/machine.model';

@Component({
  templateUrl: './edit-machine.component.html',
  styleUrls: ['../configuration.scss'],
})
export class EditMachineComponent {
  // routeSubscription: Subscription;

  form: FormGroup;

  machine?: Machine;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machinesService: MachinesService,
    private dialog: DialogService,
    private certificateErrorService: CertificateErrorService,
    formBuilder: FormBuilder
  ) {
    this.form = machineFormFactory(formBuilder, {
      disabled: new FormControl(),
    });

    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      const idParam = params.get('id');
      if (!idParam) throw new Error('Unable to determine id!');
      const id = parseInt(idParam, 10);

      this.machinesService.getMachine(id).subscribe((machine) => {
        this.machine = machine;
        requestAnimationFrame(() => {
          this.form.patchValue(machine);
        });
      });
    });
  }

  delete() {
    this.dialog
      .prompt({ messageKey: 'deleteMachinePrompt' })
      .afterClosed()
      .subscribe((result) => {
        if (result && this.machine) {
          this.handleNetworkAction(this.machinesService.deleteMachine(this.machine));
        }
      });
  }

  save() {
    this.handleNetworkAction(this.machinesService.updateMachine(this.form.value));
  }

  private handleNetworkAction(observable: Observable<any>) {
    this.form.disable();

    observable.subscribe(
      () => this.router.navigate(['/configuration/machines']),
      (ex) => {
        this.form.enable();
        this.certificateErrorService.handleCertificateException(ex).subscribe((exceptionAdded) => {
          if (exceptionAdded) {
            this.save();
          }
        });
      }
    );
  }
}
