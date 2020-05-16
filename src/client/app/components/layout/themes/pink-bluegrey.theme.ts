import { blueGrey, pink } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { merge } from 'lodash/fp';

import { commonThemeOptions } from './common.themeOptions';

export const pinkBlueGreyTheme = createMuiTheme(
  merge(commonThemeOptions, {
    palette: {
      type: 'dark',
      primary: pink,
      secondary: blueGrey
    },
    overrides: {
      MuiAppBar: {
        colorPrimary: { backgroundColor: '#212121', color: '#fff' }
      },
      MuiTabs: {
        root: {
          borderBottom: ' 1px solid rgba(255, 255, 255, 0.12)'
        }
      }
    }
  })
);
