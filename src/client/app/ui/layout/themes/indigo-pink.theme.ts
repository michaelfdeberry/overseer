import { indigo, pink } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

import { commonThemeOptions } from './common.theme';

export const indigoPinkTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    primary: indigo,
    secondary: pink,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' },
    },
  },
});
