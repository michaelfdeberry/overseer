import { Component, ComponentRef, DestroyRef, effect, inject, input, OnInit, signal, Type, untracked, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MachineForm } from '../../models/form.types';
import { Machine, MachineType } from '../../models/machine.model';
import { BambuLabMachineComponent } from '../bambu-lab-machine/bambu-lab-machine.component';
import { ElegooMachineComponent } from '../elegoo-machine/elegoo-machine.component';
import { MoonrakerMachineComponent } from '../moonraker-machine/moonraker-machine.component';
import { OctoprintMachineComponent } from '../octoprint-machine/octoprint-machine.component';
import { RepRapFirmwareMachineComponent } from '../reprapfirmware-machine/reprapfirmware-machine.component';

@Component({
  selector: 'app-machine',
  template: '',
  standalone: true,
})
export class MachineHostComponent implements OnInit {
  private destroy = inject(DestroyRef);
  private viewContainerRef = inject(ViewContainerRef);
  private machineType = signal<MachineType | undefined>(undefined);
  private machineComponentMap = {
    Octoprint: OctoprintMachineComponent,
    RepRapFirmware: RepRapFirmwareMachineComponent,
    Bambu: BambuLabMachineComponent,
    Elegoo: ElegooMachineComponent,
    Moonraker: MoonrakerMachineComponent,
  };

  form = input<FormGroup<MachineForm>>();
  machine = input<Machine | undefined>();

  constructor() {
    effect(() => {
      this.form()?.controls.machineType?.patchValue(this.machine()?.machineType);
    });
    effect(() => {
      this.viewContainerRef.clear();
      const machineType = this.machineType();
      if (!machineType) return;
      if (machineType === 'Unknown') return;

      type MachineFormComponent = { build(form: FormGroup<MachineForm>, machine: Machine): void };
      const componentRef: ComponentRef<MachineFormComponent> = this.viewContainerRef.createComponent(
        this.machineComponentMap[machineType] as Type<MachineFormComponent>
      );

      untracked(() => {
        componentRef.instance.build(this.form()!, this.machine()!);
      });
    });
  }

  ngOnInit(): void {
    const form = this.form();
    if (!form) return;

    form.addControl('machineType', new FormControl('Unknown'));
    form.controls
      .machineType!.valueChanges.pipe(takeUntilDestroyed(this.destroy))
      .subscribe((machineType) => this.machineType.set(machineType ?? undefined));
  }
}
