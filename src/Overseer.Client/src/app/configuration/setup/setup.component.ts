import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Component, ViewChild, AfterViewChecked } from '@angular/core';
import { machineFormFactory } from '../machines/shared/base-machine.component';
import { MatStepper, MatStep } from '@angular/material/stepper';
import { MachinesService } from '../../services/machines.service';
import { CertificateErrorService } from '../machines/certificate-error.service';
import { DialogService } from '../../dialogs/dialog.service';
import { AccessLevel } from '../../models/user.model';

@Component({
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements AfterViewChecked {
  busy = false;
  clientForm: FormGroup;
  userForm: FormGroup;
  machineForm: FormGroup;
  machines?: any[];
  themeForm: FormGroup;
  screenSize?: string;

  @ViewChild('stepper', { static: true })
  stepper!: MatStepper;

  @ViewChild('createMachineStep', { static: true })
  createMachineStep!: MatStep;

  get machineFormDisabled() {
    if (!this.machineForm) {
      return true;
    }

    // if machines have been added allow the user to click next without
    // completing the form
    if (this.machines && this.machines.length) {
      return false;
    }

    return this.busy || this.machineForm.invalid;
  }

  constructor(
    formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private machinesService: MachinesService,
    private certErrorService: CertificateErrorService,
    private dialogService: DialogService,
  ) {
    this.clientForm = formBuilder.group({});
    this.userForm = formBuilder.group({});
    this.themeForm = formBuilder.group({});
    this.machineForm = machineFormFactory(formBuilder);
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      const accessLevel = this.userForm.get('accessLevel');
      accessLevel?.setValue(AccessLevel.Administrator);
      accessLevel?.markAsDirty();
      accessLevel?.markAsTouched();
      accessLevel?.disable();
    });
  }

  createUser() {
    this.busy = true;

    const user = this.userForm.getRawValue();
    this.authService.createInitialUser(user).subscribe(
      () => {
        this.authService.login(user).subscribe(() => {
          // With version 1.0.0 anonymous users are no longer support,
          // and the password encryption library used was changed, and  because of this
          // the user will be forced to create a new user. However, if there are machines
          // in the database then give the user the option to skip step 2.
          // this has to be done after the user is logged in to access the machines.
          this.machinesService.getMachines().subscribe((m) => {
            if (m.length) {
              this.dialogService
                .prompt({
                  titleKey: 'setup.existingMachinesTitle',
                  messageKey: 'setup.existingMachinesMessage',
                  positiveActionTextKey: 'setup.skip',
                  negativeActionTextKey: 'addMachine',
                })
                .afterClosed()
                .subscribe((result) => {
                  this.busy = false;

                  if (result) {
                    // skip creating machines since some exist
                    this.skipMachines();
                  } else {
                    // create machine
                    this.stepper.selectedIndex = 1;
                  }
                });
            } else {
              // no machines found, create machine
              this.busy = false;
              this.stepper.selectedIndex = 1;
            }
          });
        });
      },
      () => (this.busy = false),
    );
  }

  private skipMachines() {
    this.createMachineStep.completed = true;
    this.stepper.selectedIndex = 2;
  }

  createMachine(clearAndStay: boolean) {
    // The form is invalid, but the user has already added machines
    // so allow them to progress.
    if (this.machineForm.invalid && this.machines?.length) {
      // if there is any data on the form prompt the user saying it will be lost
      if (this.machineForm.touched) {
        this.dialogService
          .prompt({ titleKey: 'invalidForm', messageKey: 'dataLoss' })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.skipMachines();
            }
          });
      } else {
        this.skipMachines();
      }

      return;
    }

    this.busy = true;
    this.machinesService.createMachine(this.machineForm.value).subscribe(
      (result) => {
        if (!this.machines) {
          this.machines = [result];
        } else {
          this.machines.push(result);
        }

        this.busy = false;
        if (clearAndStay) {
          const machineType = this.machineForm.controls['machineType'].value;
          this.machineForm.reset();
          this.machineForm.controls['machineType'].setValue(machineType);
        } else {
          this.stepper.selectedIndex = 2;
        }
      },
      (ex) => {
        this.certErrorService
          .handleCertificateException(ex)
          .subscribe((exclusionAdded) => {
            if (exclusionAdded) {
              this.createMachine(false);
            }

            this.busy = false;
          });
      },
    );
  }
}
