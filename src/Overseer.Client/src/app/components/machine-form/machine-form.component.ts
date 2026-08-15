import { Component, computed, effect, input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { I18NextPipe } from 'angular-i18next';
import { MachineMetadata } from '../../models/machine-metadata.model';
import { Machine, machineInputOptions, machineInputProperties, MachineInputProperty } from '../../models/machine.model';

export type FormFieldDescriptor = {
  propertyName: string;
  displayName: string;
  description?: string;
  isSensitive: boolean;
  isInPropertiesGroup: boolean;
  disabled?: boolean;
  options?: string[];
};

@Component({
  selector: 'app-machine-form',
  templateUrl: './machine-form.component.html',
  imports: [ReactiveFormsModule, I18NextPipe],
})
export class MachineFormComponent {
  mode = input.required<'create' | 'edit'>();
  machineMetadata = input.required<MachineMetadata[]>();
  machine = input<Machine | undefined>();
  form = input<UntypedFormGroup>();

  formFields = computed<FormFieldDescriptor[]>(() => {
    const metadata = this.machineMetadata();
    const mode = this.mode();
    if (!metadata) return [];

    const metadataPropertyNames = new Set(metadata.map((m) => m.propertyName));
    const fields: FormFieldDescriptor[] = [];

    // Add machineInputProperties not covered by metadata
    machineInputProperties.forEach((key) => {
      if (!metadataPropertyNames.has(key)) {
        fields.push({
          propertyName: key,
          displayName: key,
          isSensitive: false,
          isInPropertiesGroup: false,
          disabled: false,
          options: machineInputOptions[key as MachineInputProperty] ?? undefined,
        });
      }
    });

    // Add visible, non-ignored metadata properties
    metadata.forEach((m) => {
      var supportsSetup = m.displayType === 'Both' || m.displayType === 'SetupOnly';
      var supportsUpdate = m.displayType === 'Both' || m.displayType === 'UpdateOnly';

      if (!m.isIgnored) {
        if (mode === 'create' && !supportsSetup) return;

        fields.push({
          propertyName: m.propertyName,
          displayName: m.displayName ?? m.propertyName,
          description: m.description,
          isSensitive: m.isSensitive,
          disabled: mode === 'edit' && !supportsUpdate,
          isInPropertiesGroup: !machineInputProperties.includes(m.propertyName as MachineInputProperty),
          options: machineInputProperties.includes(m.propertyName as MachineInputProperty)
            ? (machineInputOptions[m.propertyName as MachineInputProperty] ?? undefined)
            : m.options,
        });
      }
    });

    return fields;
  });

  constructor() {
    effect(() => {
      const form = this.form();
      const metadata = this.machineMetadata();
      const mode = this.mode();
      const machine = this.machine();

      if (!form) return;
      if (!metadata) return;
      if (mode === 'edit' && !machine) return;

      form.statusChanges.subscribe(() => {
        const invalidControls: string[] = [];
        Object.keys(form.controls).forEach((key) => {
          const control = form.get(key);
          if (control?.invalid) {
            if (control instanceof UntypedFormGroup) {
              Object.keys(control.controls).forEach((subKey) => {
                if (control.get(subKey)?.invalid) {
                  invalidControls.push(`${key}.${subKey}`);
                }
              });
            } else {
              invalidControls.push(key);
            }
          }
        });
        if (invalidControls.length > 0) {
          console.log('Invalid form controls:', invalidControls);
        }
      });

      const metadataPropertyNames = new Set(metadata.map((m) => m.propertyName));

      // Add controls for dynamic properties not in metadata
      machineInputProperties.forEach((key) => {
        if (!metadataPropertyNames.has(key as string)) {
          form.addControl(key as string, new UntypedFormControl(machine?.[key] ?? null, Validators.required));
        }
      });

      // Add controls for metadata properties
      const propertiesGroup = new UntypedFormGroup({});
      form.addControl('properties', propertiesGroup);

      metadata.forEach((metadata) => {
        var supportsSetup = metadata.displayType === 'Both' || metadata.displayType === 'SetupOnly';
        var supportsUpdate = metadata.displayType === 'Both' || metadata.displayType === 'UpdateOnly';

        if (!metadata.isIgnored) {
          if (mode === 'create' && !supportsSetup) return;

          const propertyName = metadata.propertyName;
          var control = new UntypedFormControl(this.getValue(propertyName), metadata.isRequired ? Validators.required : null);
          if (mode === 'edit' && !supportsUpdate) {
            control.disable();
          }

          if (machineInputProperties.includes(metadata.propertyName as MachineInputProperty)) {
            form.addControl(propertyName, control);
          } else {
            propertiesGroup.addControl(propertyName, control);
          }
        }
      });
    });
  }

  private getValue(propertyName: string) {
    const machine = this.machine();
    if (!machine) return null;

    if (propertyName in machine) {
      return machine[propertyName as keyof Machine] ?? null;
    }

    return machine.properties?.[propertyName] ?? null;
  }
}
