import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { filter } from 'rxjs';
import { CreateMachineComponent } from '../../components/create-machine/create-machine.component';
import { MachineForm } from '../../models/form.types';
import { Machine } from '../../models/machine.model';
import { CertificateErrorService } from '../../services/certificate-error.service';
import { DialogService } from '../../services/dialog.service';
import { MachinesService } from '../../services/machines.service';
import { ToastsService } from '../../services/toast.service';

@Component({
    selector: 'app-add-machine',
    templateUrl: './add-machine.component.html',
    imports: [I18NextModule, ReactiveFormsModule, RouterLink, CreateMachineComponent],
    providers: [DialogService, CertificateErrorService]
})
export class AddMachineComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private machinesService = inject(MachinesService);
  private certificateErrorService = inject(CertificateErrorService);
  private toastsService = inject(ToastsService);

  form: FormGroup<MachineForm> = this.formBuilder.group({});

  save(): void {
    this.form.disable();
    this.machinesService.createMachine(this.form.getRawValue() as Machine).subscribe({
      complete: () => {
        this.toastsService.show({ type: 'success', message: 'savedChanges' });
        this.router.navigate(['settings', 'machines']);
      },
      error: (error) => {
        this.form.enable();
        this.certificateErrorService
          .handleCertificateException(error)
          .pipe(filter((result) => result))
          .subscribe(() => this.save());
      },
    });
  }
}
