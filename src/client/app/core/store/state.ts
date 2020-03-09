import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DisplayUser, Machine, SystemSettings } from 'overseer_lib';

export interface CoreState {
  isInitialized: boolean;
  isLocalApp?: boolean;
  requiresSetup?: boolean;
  activeUser?: DisplayUser;
  machines?: Machine[];
  users?: DisplayUser[];
  settings?: SystemSettings;
  lastErrorMessage?: string;
}

export const initialState: CoreState = {
  isInitialized: false,
};

const coreSlice = createSlice({
  name: 'core',
  initialState,
  reducers: {
    initialize(state: CoreState): CoreState {
      return state;
    },
    requiresInitialSetup(state: CoreState): void {
      state.requiresSetup = true;
      state.isInitialized = true;
    },
    initializeComplete(state: CoreState): void {
      state.requiresSetup = false;
      state.isInitialized = true;
    },
    loadActiveUser(state: CoreState, action: PayloadAction<DisplayUser | undefined>): void {
      state.activeUser = action.payload;
    },
    loadMachines(state: CoreState, action: PayloadAction<Machine[]>): void {
      state.machines = action.payload;
    },
    loadUsers(state: CoreState, action: PayloadAction<DisplayUser[]>): void {
      state.users = action.payload;
    },
    loadSystemSettings(state: CoreState, action: PayloadAction<SystemSettings>): void {
      state.settings = action.payload;
    },
    startLogout(state: CoreState): void {},
    completeLogout(state: CoreState): void {
      state = { isInitialized: true };
    },
    handleError(state: CoreState, action: PayloadAction<{ error: string; stack: string }>) {},
    displayError(state: CoreState, action: PayloadAction<string>) {
      state.lastErrorMessage = action.payload;
    },
    hideError(state: CoreState) {
      state.lastErrorMessage = undefined;
    },
  },
});

export const coreActions = coreSlice.actions;
export const coreReducer = coreSlice.reducer;
