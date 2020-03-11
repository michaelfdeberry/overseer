import { DisplayUser } from '@overseer/common/models';

import { AppState } from '../../store';

export const selectIsAppInitialized: (state: AppState) => boolean = (state: AppState) => state.core?.isInitialized;
export const selectIsAuthenticated: (state: AppState) => boolean = (state: AppState) => !!state.core?.activeUser;
export const selectIsInitialSetupRequired: (state: AppState) => boolean = (state: AppState) => state.core?.requiresSetup;
export const selectActiveUser: (state: AppState) => DisplayUser = (state: AppState) => state.core?.activeUser;
export const selectIsLocalApp: (state: AppState) => boolean = (state: AppState) => state.core?.isLocalApp;
export const selectIsRemoteApp: (state: AppState) => boolean = (state: AppState) => !selectIsLocalApp(state);
