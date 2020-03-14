import { Action } from 'redux';

import { TypedAction } from '../../store/action.type';

export enum LayoutActionTypes {
  updateTheme = '@overseer/client/layout/updateTheme',
  updateThemeComplete = '@overseer/client/layout/updateThemeComplate',
}

export const layoutActions = {
  updateTheme(currentTheme: string): TypedAction<{ currentTheme: string }> {
    return { type: LayoutActionTypes.updateTheme, currentTheme };
  },
  updateThemeComplete(): Action<string> {
    return { type: LayoutActionTypes.updateThemeComplete };
  },
};
