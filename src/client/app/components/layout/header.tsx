import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { HeaderMenu } from './header-menu';

export const Header: React.FunctionComponent = () => {
  return (
    <AppBar className="header" position="relative">
      <Toolbar>
        <div className="header-title">
          <Typography variant="h6" component={Link} to="/">
            Overseer
          </Typography>
        </div>
        <HeaderMenu></HeaderMenu>
      </Toolbar>
    </AppBar>
  );
};
