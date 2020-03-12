import { createMuiTheme } from '@material-ui/core';
import { blueGrey, pink } from '@material-ui/core/colors';

export const pinkBlueGreyTheme = createMuiTheme({
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
