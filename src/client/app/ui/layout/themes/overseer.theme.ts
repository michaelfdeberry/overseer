import { createMuiTheme, PaletteColorOptions } from '@material-ui/core/styles';

import { commonThemeOptions } from './common.theme';

const overseerPalette: PaletteColorOptions = {
  main: '#2f80ed',
  light: '#e6f0fd',
};

export const overseerLightTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    primary: overseerPalette,
    secondary: overseerPalette,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' },
    },
  },
});

export const overseerDarkTheme = createMuiTheme({
  ...commonThemeOptions,
  palette: {
    type: 'dark',
    primary: overseerPalette,
    secondary: overseerPalette,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#212121' },
    },
  },
});
