import { amber, deepPurple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { merge } from 'lodash/fp';

import { commonThemeOptions } from './common.themeOptions';

export const deepPurpleAmberTheme = createMuiTheme(
  merge(commonThemeOptions, {
    ...commonThemeOptions,
    palette: {
      primary: deepPurple,
      secondary: amber
    }
  })
);
