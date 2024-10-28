import { Component, ComponentRef, DestroyRef, effect, inject, input, OnInit, signal, untracked, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MachineForm } from '../../models/form.types';
import { Machine, MachineType } from '../../models/machine.model';
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

  form = input<FormGroup<MachineForm>>();
  machine = input<Machine | undefined>();

  constructor() {
    effect(() => {
      console.log('Machine changed', this.machine());
      this.form()?.controls.machineType?.patchValue(this.machine()?.machineType);
    });
    effect(() => {
      console.log('Machine type changed', this.machineType());
      this.viewContainerRef.clear();
      const machineType = this.machineType();
      if (!machineType) return;
      if (machineType === 'Unknown') return;

      let componentRef: ComponentRef<OctoprintMachineComponent> | ComponentRef<RepRapFirmwareMachineComponent>;
      switch (machineType) {
        case 'Octoprint':
          componentRef = this.viewContainerRef.createComponent(OctoprintMachineComponent);
          break;
        case 'RepRapFirmware':
          componentRef = this.viewContainerRef.createComponent(RepRapFirmwareMachineComponent);
          break;
      }

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
