import { indigo, pink } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { merge } from 'lodash/fp';

import { commonThemeOptions } from './common.themeOptions';

export const indigoPinkTheme = createMuiTheme(
  merge(commonThemeOptions, {
    palette: {
      primary: indigo,
      secondary: pink,
    },
  })
);
