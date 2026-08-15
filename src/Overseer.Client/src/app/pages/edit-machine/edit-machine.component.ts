import { Location } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18NextPipe } from 'angular-i18next';
import { filter, map, Observable, switchMap } from 'rxjs';
import { CardSectionComponent } from '../../components/card-section/card-section.component';
import { MachineFormComponent } from '../../components/machine-form/machine-form.component';
import { Machine } from '../../models/machine.model';
import { CertificateErrorService } from '../../services/certificate-error.service';
import { DialogService } from '../../services/dialog.service';
import { MachinesService } from '../../services/machines.service';
import { ToastsService } from '../../services/toast.service';

@Component({
  selector: 'app-edit-machine',
  templateUrl: './edit-machine.component.html',
  imports: [CardSectionComponent, I18NextPipe, ReactiveFormsModule, RouterLink, MachineFormComponent],
  providers: [DialogService, CertificateErrorService],
})
export class EditMachineComponent {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private machinesService = inject(MachinesService);
  private dialogService = inject(DialogService);
  private certificateErrorService = inject(CertificateErrorService);
  private toastsService = inject(ToastsService);

  form?: UntypedFormGroup;

  machine = signal<Machine | undefined>(undefined);

  allMachineMetadata = rxResource({ stream: () => this.machinesService.getMachineMetadata() });

  machineMetadata = computed(() => {
    if (this.allMachineMetadata.isLoading()) return undefined;
    if (this.allMachineMetadata.error()) return undefined;

    console.log('All machine metadata:', this.allMachineMetadata.value());
    let machine = this.machine();
    if (!machine?.machineType) return undefined;

    console.log('Current machine type:', machine.machineType);
    return this.allMachineMetadata.value()?.[machine.machineType];
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((id) => this.machinesService.getMachine(id))
      )
      .subscribe((machine: Machine) => {
        this.machine.set(machine);
        this.form = this.formBuilder.nonNullable.group({}, { updateOn: 'change' });
        this.form.addControl('id', new FormControl(machine?.id));
        this.form.addControl('machineType', new FormControl(machine.machineType));
        this.form.addControl('disabled', new FormControl(machine['disabled'] ?? false));
      });

    effect(() => {
      var machines = this.machinesService.machines.value();
      if (!machines) return;

      var machine = machines.find((m) => m.id === this.machine()?.id);
      if (machine) {
        this.machine.set(machine);
      }
    });
  }

  deleteMachine() {
    this.dialogService
      .prompt({ messageKey: 'deleteMachinePrompt' })
      .closed.pipe(filter((result) => result))
      .subscribe(() => this.handleNetworkAction(this.machinesService.deleteMachine(this.machine()!)));
  }

  save() {
    var update = this.form!.getRawValue();
    this.handleNetworkAction(
      this.machinesService.updateMachine({
        ...this.machine(),
        ...update,
        properties: {
          ...this.machine()?.properties,
          ...update.properties,
        },
      } as Machine)
    );
  }

  updateMonitoring(disabled: boolean): void {
    const machine = this.machine();
    if (!machine) return;

    if (disabled) {
      this.machinesService.disableMonitoring(machine.id).subscribe();
    } else {
      this.machinesService.enableMonitoring(machine.id).subscribe();
    }
  }

  private handleNetworkAction(observable: Observable<any>) {
    this.form?.disable();

    observable.subscribe({
      complete: () => {
        this.toastsService.show({ message: 'savedChanges', type: 'success' });
        this.location.back();
      },
      error: (ex) => {
        this.form?.enable();
        this.certificateErrorService
          .handleCertificateException(ex)
          .pipe(filter((result) => result))
          .subscribe(() => this.save());
      },
    });
  }
}
