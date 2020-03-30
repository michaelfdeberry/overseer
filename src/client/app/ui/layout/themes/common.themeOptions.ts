import { ThemeOptions } from '@material-ui/core';

export const commonThemeOptions: ThemeOptions = {
  typography: {
    fontSize: 13,
    button: {
      textTransform: 'none',
      whiteSpace: 'nowrap',
    },
    caption: {
      fontSize: 13,
      fontWeight: 'bold',
    },
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' },
    },
    MuiTabs: {
      root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
    },
  },
};
