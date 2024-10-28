import { Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { I18NextModule } from 'angular-i18next';
import { machineTypes } from '../../models/constants';
import { MachineForm } from '../../models/form.types';
import { MachineHostComponent } from '../machine-host/machine-host.component';

@Component({
  selector: 'app-create-machine',
  templateUrl: './create-machine.component.html',
  standalone: true,
  imports: [MachineHostComponent, I18NextModule, ReactiveFormsModule],
})
export class CreateMachineComponent implements OnInit {
  machineTypes = machineTypes;
  form = input<FormGroup<MachineForm>>();

  ngOnInit(): void {
    this.form()?.addControl('machineType', new FormControl('Unknown'));
  }
}
