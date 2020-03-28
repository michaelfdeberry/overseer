import { createMuiTheme, PaletteColorOptions } from '@material-ui/core/styles';
import { merge } from 'lodash/fp';

import { commonThemeOptions } from './common.themeOptions';

const overseerPalette: PaletteColorOptions = {
  main: '#2f80ed',
  light: '#e6f0fd',
};

export const overseerLightTheme = createMuiTheme(
  merge(commonThemeOptions, {
    palette: {
      primary: overseerPalette,
      secondary: overseerPalette,
    },
  })
);

export const overseerDarkTheme = createMuiTheme(
  merge(commonThemeOptions, {
    palette: {
      type: 'dark',
      primary: overseerPalette,
      secondary: overseerPalette,
    },
    overrides: {
      MuiAppBar: {
        colorPrimary: { backgroundColor: '#212121', color: '#fff' },
      },
      MuiTabs: {
        root: {
          borderBottom: ' 1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  })
);
