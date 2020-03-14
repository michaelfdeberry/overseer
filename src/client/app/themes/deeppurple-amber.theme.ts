import { amber, deepPurple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

import { commonThemeOptions } from './common.theme';

export const deepPurpleAmberTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    primary: deepPurple,
    secondary: amber,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' },
    },
  },
});
