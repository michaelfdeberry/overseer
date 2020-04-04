import { CssBaseline, ThemeProvider } from '@material-ui/core';
import * as React from 'react';

import { useSelector } from '../../hooks';
import { Content } from './content';
import { Header } from './header';
import { Loader } from './loader';
import { defaultTheme, themeMap } from './themes';

const Layout: React.FunctionComponent = () => {
  const themeName = useSelector(state => state.currentTheme);

  return (
    <ThemeProvider theme={themeMap[themeName || defaultTheme]}>
      <CssBaseline />
      <Loader />
      <Header></Header>
      <Content></Content>
    </ThemeProvider>
  );
};

export default Layout;
