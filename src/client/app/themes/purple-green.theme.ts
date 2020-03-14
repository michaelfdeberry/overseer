import { green, purple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

import { commonThemeOptions } from './common.theme';

export const purpleGreenTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    primary: purple,
    secondary: green,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' },
    },
  },
});
