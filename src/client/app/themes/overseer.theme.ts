import { createMuiTheme, PaletteColorOptions } from '@material-ui/core/styles';

const overseerPalette: PaletteColorOptions = {
  main: '#2f80ed',
  light: '#e6f0fd',
};

export const overseerLightTheme = createMuiTheme({
  palette: {
    primary: overseerPalette,
    secondary: overseerPalette,
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5' },
    },
  },
});

export const overseerDarkTheme = createMuiTheme({
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
