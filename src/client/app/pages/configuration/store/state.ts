import { DisplayUser, Machine } from '@overseer/common/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CreateUserFormState } from './form-states/create-user-form.state';
import { MachineConfigurationFormState } from './form-states/machine-configuration-form.state';

export interface ConfigurationState {
  setupPageLoaded?: boolean;
  setupPageCurrentStep?: number;
  completeCurrentStep?: boolean;
  createUserState?: CreateUserFormState;
  createMachinesState?: MachineConfigurationFormState;
}

export const initialState: ConfigurationState = {};

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    loadSetupPage(state: ConfigurationState): void {
      state.setupPageLoaded = true;
      state.setupPageCurrentStep = 1;
    },
    submitUserStep(state: ConfigurationState, _action: PayloadAction<CreateUserFormState>): void {
      state.completeCurrentStep = true;
    },
    completeSetupUserStep(state: ConfigurationState, _action: PayloadAction<DisplayUser>): void {
      state.setupPageCurrentStep = state.setupPageCurrentStep + 1;
    },
    submitMachineStep(state: ConfigurationState, _action: PayloadAction<MachineConfigurationFormState>): void {
      state.completeCurrentStep = true;
    },
    completeSetupMachineStep(state: ConfigurationState, _action: PayloadAction<Machine>): void {
      state.setupPageCurrentStep = state.setupPageCurrentStep + 1;
    },
    updateCreateUserState(state: ConfigurationState, action: PayloadAction<CreateUserFormState>): void {
      state.createUserState = action.payload;
    },
    updateCreateMachineState(state: ConfigurationState, action: PayloadAction<MachineConfigurationFormState>): void {
      state.createMachinesState = action.payload;
    },
    startCreateUser(state: ConfigurationState, action: PayloadAction<CreateUserFormState>): void {
      state.createUserState = action.payload;
    },
    completeCreateUser(state: ConfigurationState, _action: PayloadAction<DisplayUser>): void {
      state.createUserState = undefined;
    },
    startCreateMachine(state: ConfigurationState, action: PayloadAction<MachineConfigurationFormState>): void {
      state.createMachinesState = action.payload;
    },
    startCreateMultipleMachines(state: ConfigurationState, action: PayloadAction<MachineConfigurationFormState>): void {
      state.createMachinesState = action.payload;
    },
    completeCreateMachine(state: ConfigurationState, _action: PayloadAction<Machine>): void {
      state.createMachinesState = undefined;
    },
  },
});

export const configurationActions = configurationSlice.actions;
export const configurationReducer = configurationSlice.reducer;
