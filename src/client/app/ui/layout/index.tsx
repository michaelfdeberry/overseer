import { CssBaseline, ThemeProvider } from '@material-ui/core';
import * as React from 'react';

import { useSelector } from '../../hooks';
import { Content } from './components/content';
import { Header } from './components/header';
import { Loader } from './components/loader';
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
