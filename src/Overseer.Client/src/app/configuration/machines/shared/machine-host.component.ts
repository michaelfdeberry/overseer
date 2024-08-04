import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Machine, MachineType } from '../../../models/machine.model';
import { MachinesService } from '../../../services/machines.service';
import { BaseMachineComponent } from './base-machine.component';
import { OctoprintMachineComponent } from './octoprint-machine.component';
import { RepRapFirmwareMachineComponent } from './reprapfirmware-machine.component';

@Component({
  selector: 'app-machine',
  template: '',
})
export class MachineHostComponent implements OnInit, OnDestroy {
  constructor(
    private machinesService: MachinesService,
    public viewContainerRef: ViewContainerRef
  ) {}

  @Input() form!: FormGroup;

  @Input() machine?: Machine;

  private currentMachineType?: MachineType;

  private machineTypeSubscription?: Subscription;

  private machineTypeComponentMap = new Map([
    [MachineType.Octoprint, OctoprintMachineComponent],
    [MachineType.RepRapFirmware, RepRapFirmwareMachineComponent],
  ]);

  ngOnInit() {
    this.machineTypeSubscription = this.form.controls['machineType'].valueChanges.subscribe((machineType: MachineType) => {
      requestAnimationFrame(() => {
        if (this.currentMachineType === machineType) {
          return;
        }

        this.currentMachineType = machineType;
        const configComponentType = this.machineTypeComponentMap.get(machineType);
        if (!configComponentType) {
          return;
        }

        this.viewContainerRef.clear();

        const componentRef = this.viewContainerRef.createComponent(configComponentType);
        const instance = <BaseMachineComponent>componentRef.instance;
        instance.form = this.form;
        instance.machine = this.machine;
        instance.enableAdvancedSettings = this.machinesService.supportsAdvanceSettings;
      });
    });
  }

  ngOnDestroy() {
    this.machineTypeSubscription?.unsubscribe();
  }
}
