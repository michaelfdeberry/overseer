import { green, purple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { merge } from 'lodash/fp';

import { commonThemeOptions } from './common.themeOptions';

export const purpleGreenTheme = createMuiTheme(
  merge(commonThemeOptions, {
    palette: {
      primary: purple,
      secondary: green
    }
  })
);
