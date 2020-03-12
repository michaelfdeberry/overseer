import { green, purple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

export const purpleGreenTheme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: green,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5' },
    },
  },
});
