import { MachineConfiguration } from '@overseer/common/models';

export interface MachineConfigurationFormState {
  isValid?: boolean;
  type?: string;
  configuration?: Map<string, MachineConfiguration>;
}
