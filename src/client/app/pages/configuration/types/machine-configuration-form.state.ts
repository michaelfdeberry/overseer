import { MachineConfigurationCollection } from '@overseer/common/models';

export interface MachineConfigurationFormState {
  isValid?: boolean;
  machineType?: string;
  configuration?: MachineConfigurationCollection;
}
