import { indigo, pink } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

export const indigoPinkTheme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: pink,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5' },
    },
  },
});
