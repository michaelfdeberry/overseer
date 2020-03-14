import { createMuiTheme } from '@material-ui/core';
import { blueGrey, pink } from '@material-ui/core/colors';

import { commonThemeOptions } from './common.theme';

export const pinkBlueGreyTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    type: 'dark',
    primary: pink,
    secondary: blueGrey,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#212121' },
    },
  },
});
