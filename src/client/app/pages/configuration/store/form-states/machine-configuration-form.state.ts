import { MachineConfiguration } from 'overseer_lib';

export interface MachineConfigurationFormState {
  isValid?: boolean;
  type?: string;
  configuration?: Map<string, MachineConfiguration>;
}
