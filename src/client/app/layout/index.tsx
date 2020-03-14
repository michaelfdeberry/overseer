import { CssBaseline, ThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { AppState } from '../store';
import { themeMap } from '../themes';
import { Content } from './components/content';
import { Header } from './components/header';

const Layout: React.FunctionComponent = () => {
  const themeName = useSelector<AppState, string>(state => state.layout.currentTheme);
  if (!themeName) return null;

  return (
    <ThemeProvider theme={themeMap[themeName]}>
      <CssBaseline />
      <Header></Header>
      <Content></Content>
    </ThemeProvider>
  );
};

export default Layout;
