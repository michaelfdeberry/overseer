import { CreateUserFormState } from '../types/create-user-form.state';
import { MachineConfigurationFormState } from '../types/machine-configuration-form.state';

export interface ConfigurationState {
  setup?: {
    loaded: boolean;
    currentStep: number;
    adminStepComplete?: boolean;
    machineStepComplete?: boolean;
    themeStepComplete?: boolean;
  };
  users: {
    createState?: CreateUserFormState;
  };
  machines: {
    formState?: MachineConfigurationFormState;
  };
}

export const initialState: ConfigurationState = {
  users: {},
  machines: {},
};
