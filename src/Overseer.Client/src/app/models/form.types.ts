import { FormControl } from '@angular/forms';
import { MachineType, WebCamOrientation } from './machine.model';
import { AccessLevel } from './user.model';

export type CreateUserForm = {
  username?: FormControl<string | null>;
  password?: FormControl<string | null>;
  confirmPassword?: FormControl<string | null>;
  sessionLifetime?: FormControl<number | null>;
  accessLevel?: FormControl<AccessLevel | null>;
};

export type MachineFormBase = {
  name?: FormControl<string | undefined | null>;
  machineType?: FormControl<MachineType | undefined | null>;
  url?: FormControl<string | undefined | null>;
  webCamUrl?: FormControl<string | undefined | null>;
  webCamOrientation?: FormControl<WebCamOrientation | undefined | null>;
  clientCertificate?: FormControl<string | undefined | null>;
};

export type OctoprintMachineForm = MachineFormBase & {
  apiKey?: FormControl<string | undefined | null>;
  profile?: FormControl<string | undefined | null>;
};

export type RepRapMachineForm = MachineFormBase;

export type MachineForm = RepRapMachineForm | OctoprintMachineForm;
