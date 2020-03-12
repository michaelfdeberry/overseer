import { MachineConfigurationCollection } from '@overseer/common/models';

export interface MachineConfigurationFormState {
  isValid?: boolean;
  type?: string;
  configuration?: MachineConfigurationCollection;
}
