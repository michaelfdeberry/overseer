import { amber, deepPurple } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

export const deepPurpleAmberTheme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: amber,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5' },
    },
  },
});
