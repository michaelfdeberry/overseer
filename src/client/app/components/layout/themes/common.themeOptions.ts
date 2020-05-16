import { ThemeOptions } from '@material-ui/core/styles';

const defaultFontSize = 14;
export const commonThemeOptions: ThemeOptions = {
  typography: {
    fontSize: defaultFontSize,
    button: {
      textTransform: 'none',
      whiteSpace: 'nowrap'
    },
    caption: {
      fontSize: 13,
      fontWeight: 'bold'
    },
    body1: {
      fontSize: defaultFontSize
    }
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: { backgroundColor: '#f5f5f5', color: '#444' }
    },
    MuiTabs: {
      root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }
    },
    MuiInputBase: {
      root: {
        fontSize: defaultFontSize
      }
    }
  }
};
