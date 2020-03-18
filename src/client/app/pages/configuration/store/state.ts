export interface ConfigurationState {
  setup?: {
    loaded: boolean;
    currentStep: number;
    adminStepComplete?: boolean;
    machineStepComplete?: boolean;
    themeStepComplete?: boolean;
  };
  users: {
    loaded?: boolean;
    complete?: boolean;
  };
  machines: {
    loaded?: boolean;
    complete?: boolean;
  };
}

export const initialState: ConfigurationState = {
  users: {},
  machines: {},
};
