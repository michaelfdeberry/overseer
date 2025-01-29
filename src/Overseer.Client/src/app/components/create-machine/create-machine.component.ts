import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { DisplayOption } from '../../models/constants';
import { MachineForm } from '../../models/form.types';
import { MachineType } from '../../models/machine.model';
import { MachineHostComponent } from '../machine-host/machine-host.component';
import { MachinesService } from '../../services/machines.service';

@Component({
    selector: 'app-create-machine',
    templateUrl: './create-machine.component.html',
    imports: [MachineHostComponent, I18NextModule, ReactiveFormsModule]
})
export class CreateMachineComponent implements OnInit {
  private machinesService = inject(MachinesService);
  machineTypes?: DisplayOption<MachineType>[];
  form = input<FormGroup<MachineForm>>();

  constructor() {
    this.machinesService.getMachineTypes().subscribe((types) => {
      this.machineTypes = types.map((type) => new DisplayOption(type, type));
    });
  }

  ngOnInit(): void {
    this.form()?.addControl('machineType', new FormControl('Unknown'));
  }
}
