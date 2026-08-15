import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NextPipe } from 'angular-i18next';
import { filter, of, switchMap, tap } from 'rxjs';
import { CreateMachineComponent } from '../../components/create-machine/create-machine.component';
import { CreateUserComponent } from '../../components/create-user/create-user.component';
import { UnauthenticatedComponent } from '../../components/unauthenticated/unauthenticated.component';
import { CreateUserForm } from '../../models/form.types';
import { InitializationState, InitializationStatus } from '../../models/initialization-status.type';
import { Machine } from '../../models/machine.model';
import { User } from '../../models/user.model';
import { AuthenticationService } from '../../services/authentication.service';
import { CertificateErrorService } from '../../services/certificate-error.service';
import { DialogService } from '../../services/dialog.service';
import { MachinesService } from '../../services/machines.service';
import { ToastsService } from '../../services/toast.service';
import { PluginsComponent } from '../plugins/plugins.component';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  imports: [UnauthenticatedComponent, I18NextPipe, ReactiveFormsModule, CreateUserComponent, CreateMachineComponent, PluginsComponent],
  providers: [DialogService, CertificateErrorService],
})
export class SetupComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private machinesService = inject(MachinesService);
  private dialogService = inject(DialogService);
  private certErrorService = inject(CertificateErrorService);
  private toastsService = inject(ToastsService);

  machines: Machine[] = [];
  step = signal<InitializationState>('Admin');
  adminForm: FormGroup<CreateUserForm> = this.formBuilder.nonNullable.group({});
  machinesForm: UntypedFormGroup = this.formBuilder.nonNullable.group({});

  constructor() {
    effect(() => {
      if (this.step() === 'Initialized') {
        this.router.navigate(['/']);
        untracked(() => {
          this.toastsService.show({
            type: 'success',
            message: 'pages.setup.setupComplete',
          });
        });
      }
    });

    effect(() => {
      const lastNav = this.router.lastSuccessfulNavigation();
      if (!lastNav) return;

      console.log('Last navigation state:', lastNav.extras.state);
      const initializationStatus = lastNav.extras.state as InitializationStatus | undefined;
      this.step.set(initializationStatus?.state ?? 'Admin');
    });
  }

  handleAdminSubmit(): void {
    if (this.adminForm.invalid) return;

    const user: User = this.adminForm.getRawValue();
    this.adminForm.disable();
    this.authenticationService
      .createInitialUser(user)
      .pipe(
        switchMap(() => this.authenticationService.login(user)),
        tap(() => this.step.set('Plugins')),
        switchMap(() => this.machinesService.getMachines()),
        switchMap((machines) => {
          if (machines.length > 0) {
            return this.dialogService.prompt({
              titleKey: 'pages.setup.existingMachinesTitle',
              messageKey: 'pages.setup.existingMachinesMessage',
              positiveActionTextKey: 'pages.setup.skip',
              negativeActionTextKey: 'addMachine',
            }).closed;
          }
          return of(false);
        }),
        filter((result) => result),
        tap(() => this.step.set('Initialized'))
      )
      .subscribe({
        error: () => this.adminForm.enable(),
      });
  }

  handleMachineSubmit(createAnother: boolean): void {
    // The form is invalid, but the user has already added machines
    // so allow them to progress.
    if (!createAnother && this.machinesForm.invalid && this.machines?.length) {
      // if there is any data on the form prompt the user saying it will be lost
      if (this.machinesForm.touched) {
        this.dialogService.prompt({ titleKey: 'invalidForm', messageKey: 'dataLoss' }).closed.subscribe((result) => {
          if (result) {
            this.step.set('Initialized');
          }
        });
      } else {
        this.step.set('Initialized');
      }
    } else {
      if (this.machinesForm.invalid) return;

      this.machinesForm.disable();
      const machine = this.machinesForm.getRawValue() as Machine;
      this.machinesService.createMachine(machine).subscribe({
        next: (result) => {
          this.machines.push(result);

          if (createAnother) {
            this.machinesForm.reset();
            this.machinesForm.enable();
          } else {
            this.step.set('Initialized');
          }
        },
        error: (ex) => {
          this.certErrorService.handleCertificateException(ex).subscribe((exclusionAdded) => {
            this.machinesForm.enable();
            if (exclusionAdded) {
              this.handleMachineSubmit(createAnother);
            }
          });
        },
      });
    }
  }
}
