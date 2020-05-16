import { Theme } from '@material-ui/core/styles';

import { deepPurpleAmberTheme } from './deeppurple-amber.theme';
import { indigoPinkTheme } from './indigo-pink.theme';
import { overseerDarkTheme, overseerLightTheme } from './overseer.theme';
import { pinkBlueGreyTheme } from './pink-bluegrey.theme';
import { purpleGreenTheme } from './purple-green.theme';

export const defaultTheme = 'Overseer Dark (Default)';

export const themeMap: { [key: string]: Theme } = {
  [defaultTheme]: overseerDarkTheme,
  'Overseer Light': overseerLightTheme,
  'Deep Purple / Amber': deepPurpleAmberTheme,
  'Indigo / Pink': indigoPinkTheme,
  'Pink / Blue-grey': pinkBlueGreyTheme,
  'Purple / Green': purpleGreenTheme
};
