import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { I18NextPipe, I18NextService } from 'angular-i18next';
import { map } from 'rxjs';
import { DisplayOption } from '../../models/constants';
import { MachineForm } from '../../models/form.types';
import { MachineType } from '../../models/machine.model';
import { MachinesService } from '../../services/machines.service';
import { MachineHostComponent } from '../machine-host/machine-host.component';

@Component({
  selector: 'app-create-machine',
  templateUrl: './create-machine.component.html',
  imports: [MachineHostComponent, I18NextPipe, ReactiveFormsModule],
})
export class CreateMachineComponent implements OnInit {
  private machinesService = inject(MachinesService);
  private i18NextService = inject(I18NextService);

  machineTypes?: DisplayOption<MachineType>[];
  form = input<FormGroup<MachineForm>>();

  constructor() {
    this.machinesService
      .getMachineTypes()
      .pipe(
        map((types) => {
          return types.sort((a, b) => {
            return this.i18NextService.t(a).localeCompare(this.i18NextService.t(b));
          });
        })
      )
      .subscribe((types) => {
        this.machineTypes = types.map((type) => new DisplayOption(type, type));
      });
  }

  ngOnInit(): void {
    this.form()?.addControl('machineType', new FormControl('Unknown'));
  }
}
