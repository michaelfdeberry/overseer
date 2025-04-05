import { FormControl } from '@angular/forms';
import { MachineType, WebCamOrientation } from './machine.model';
import { AccessLevel } from './user.model';

export type CreateUserForm = {
  username?: FormControl<string>;
  password?: FormControl<string>;
  confirmPassword?: FormControl<string>;
  sessionLifetime?: FormControl<number>;
  accessLevel?: FormControl<AccessLevel>;
};

export type MachineFormBase = {
  name?: FormControl<string | undefined | null>;
  machineType?: FormControl<MachineType | undefined | null>;
  url?: FormControl<string | undefined | null>;
  webCamUrl?: FormControl<string | undefined | null>;
  webCamOrientation?: FormControl<WebCamOrientation | undefined | null>;
  clientCertificate?: FormControl<string | undefined | null>;
  disabled?: FormControl<boolean | undefined | null>;
};

export type OctoprintMachineForm = MachineFormBase & {
  apiKey?: FormControl<string | undefined | null>;
  profile?: FormControl<string | undefined | null>;
};

export type RepRapMachineForm = MachineFormBase & {
  password?: FormControl<string | undefined | null>;
};

export type BambuMachineForm = MachineFormBase & {
  accessCode?: FormControl<string | undefined | null>;
  serial?: FormControl<string | undefined | null>;
};

export type ElegooMachineForm = Exclude<MachineFormBase, 'url'> & {
  ipAddress?: FormControl<string | undefined | null>;
};

export type MachineForm = RepRapMachineForm | OctoprintMachineForm | BambuMachineForm;
