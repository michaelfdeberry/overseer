import { DisplayUser, Machine, SystemSettings } from '@overseer/common/models';

import { AppState } from '../../store';

export const selectIsAppInitialized = (state: AppState): boolean => state.core?.isInitialized;
export const selectIsAuthenticated = (state: AppState): boolean => !!state.core?.activeUser;
export const selectIsInitialSetupRequired = (state: AppState): boolean => state.core?.requiresSetup;
export const selectActiveUser = (state: AppState): DisplayUser => state.core?.activeUser;
export const selectIsLocalApp = (state: AppState): boolean => state.core?.isLocalApp;
export const selectIsRemoteApp = (state: AppState): boolean => !selectIsLocalApp(state);
export const selectSystemSettings = (state: AppState): SystemSettings => state.core.settings;
export const selectMachines = (state: AppState): Machine[] => state.core.machines;
export const selectUsers = (state: AppState): DisplayUser[] => state.core.users;
