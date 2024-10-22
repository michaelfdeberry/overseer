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
      this.viewContainerRef.clear();
      const machineType = this.machineType();
      if (!machineType) return;

      let componentRef: ComponentRef<OctoprintMachineComponent> | ComponentRef<RepRapFirmwareMachineComponent>;
      switch (Number(machineType)) {
        case MachineType.Octoprint:
          componentRef = this.viewContainerRef.createComponent(OctoprintMachineComponent);
          break;
        case MachineType.RepRapFirmware:
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

    form.addControl('machineType', new FormControl(MachineType.Octoprint));
    form.controls
      .machineType!.valueChanges.pipe(takeUntilDestroyed(this.destroy))
      .subscribe((machineType: MachineType | null | undefined) => this.machineType.set(machineType ?? undefined));
  }
}
