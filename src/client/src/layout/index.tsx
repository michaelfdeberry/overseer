import * as React from 'react';

import { Content } from './components/content';
import { Header } from './components/header';

const Layout: React.FunctionComponent = () => {
  return (
    <div>
      <Header></Header>
      <Content></Content>
    </div>
  );
};

export default Layout;
