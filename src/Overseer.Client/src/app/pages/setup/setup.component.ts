import { AfterViewInit, Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { I18NextModule, I18NextPipe } from 'angular-i18next';
import { catchError, filter, iif, map, of, switchMap, tap } from 'rxjs';
import { CreateUserComponent } from '../../components/create-user/create-user.component';
import { UnauthenticatedComponent } from '../../components/unauthenticated/unauthenticated.component';
import { CreateUserForm, MachineForm } from '../../models/form.types';
import { AccessLevel, User } from '../../models/user.model';
import { AuthenticationService } from '../../services/authentication.service';
import { MachinesService } from '../../services/machines.service';
import { ToastsService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import { CreateMachineComponent } from '../../components/create-machine/create-machine.component';
import { Machine } from '../../models/machine.model';
import { CertificateErrorService } from '../../services/certificate-error.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  standalone: true,
  imports: [UnauthenticatedComponent, I18NextModule, ReactiveFormsModule, CreateUserComponent, CreateMachineComponent],
  providers: [DialogService, CertificateErrorService],
})
export class SetupComponent implements AfterViewInit {
  private i18NextPipe = inject(I18NextPipe);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private machinesService = inject(MachinesService);
  private dialogService = inject(DialogService);
  private certErrorService = inject(CertificateErrorService);
  private toastsService = inject(ToastsService);

  machines: Machine[] = [];
  step = signal<'user' | 'machines' | 'complete'>('user');
  adminForm: FormGroup<CreateUserForm> = this.formBuilder.group({});
  machinesForm: FormGroup<MachineForm> = this.formBuilder.group({});

  constructor() {
    effect(() => {
      if (this.step() === 'complete') {
        this.router.navigate(['/']);
        untracked(() => {
          this.toastsService.show({
            type: 'success',
            message: this.i18NextPipe.transform('pages.setup.setupComplete'),
          });
        });
      }
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      console.log('SetupComponent.ngAfterViewInit');
      const accessLevel = this.adminForm.get('accessLevel');
      accessLevel?.setValue(AccessLevel.Administrator);
      accessLevel?.disable();
      console.log('SetupComponent.ngAfterViewInit', this.adminForm.value);
    });
  }

  handleAdminSubmit(): void {
    if (this.adminForm.invalid) return;

    const user = this.adminForm.getRawValue() as User;
    this.adminForm.disable();
    this.authenticationService
      .createInitialUser(user)
      .pipe(
        switchMap(() => this.authenticationService.login(user)),
        tap(() => this.step.set('machines')),
        switchMap(() => this.machinesService.getMachines()),
        switchMap((machines) =>
          iif(
            () => !!machines.length,
            this.dialogService.prompt({
              titleKey: 'pages.setup.existingMachinesTitle',
              messageKey: 'pages.setup.existingMachinesMessage',
              positiveActionTextKey: 'pages.setup.skip',
              negativeActionTextKey: 'addMachine',
            }).closed,
            of(false)
          )
        ),
        filter((result) => result),
        tap(() => this.step.set('complete'))
      )
      .subscribe({
        error: () => this.adminForm.enable(),
      });
  }

  handleMachineSubmit(createAnother: boolean): void {
    // The form is invalid, but the user has already added machines
    // so allow them to progress.
    if (this.machinesForm.invalid && this.machines?.length) {
      // if there is any data on the form prompt the user saying it will be lost
      if (this.machinesForm.touched) {
        this.dialogService.prompt({ titleKey: 'invalidForm', messageKey: 'dataLoss' }).closed.subscribe((result) => {
          if (result) {
            this.step.set('complete');
          }
        });
      } else {
        this.step.set('complete');
      }
    } else {
      this.machinesForm.disable();
      const machine = this.machinesForm.value as Machine;
      this.machinesService.createMachine(machine).subscribe({
        next: (result) => {
          if (!this.machines) {
            this.machines = [result];
          } else {
            this.machines.push(result);
          }

          if (createAnother) {
            const machineType = this.machinesForm.controls.machineType!.value;
            this.machinesForm.reset();
            this.machinesForm.controls.machineType!.setValue(machineType);
          } else {
            this.step.set('complete');
          }
        },
        error: (ex) => {
          this.certErrorService.handleCertificateException(ex).subscribe((exclusionAdded) => {
            if (exclusionAdded) {
              this.handleMachineSubmit(createAnother);
            }
          });
        },
      });
    }
  }
}
