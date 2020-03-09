import { Icon, IconButton, Menu, MenuItem } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { selectIsAuthenticated } from '../../core/store/selectors';
import { coreActions } from '../../core/store/state';
import { AppState } from '../../store';

export const HeaderMenu: React.FunctionComponent = () => {
  const isAuthenticated = useSelector<AppState>(selectIsAuthenticated);
  if (!isAuthenticated) return null;

  const dispatch = useDispatch();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = !!anchorEl;
  const configRoute = useRouteMatch('/configuration');

  function openMenu(event: React.MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu(): void {
    setAnchorEl(null);
  }

  function navigateToConfiguration(): void {
    closeMenu();

    if (!configRoute?.isExact) {
      history.push('/configuration');
    }
  }

  function navigateToLogin(): void {
    closeMenu();
    dispatch(coreActions.startLogout());
    history.push('/login');
  }

  return (
    <div className="header-menu-container">
      <IconButton onClick={openMenu} color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu
        className="header-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={closeMenu}
      >
        <MenuItem onClick={navigateToConfiguration}>
          <span className="header-menu-item-text">Settings</span>
          <Icon>
            <SettingsIcon />
          </Icon>
        </MenuItem>
        <MenuItem onClick={navigateToLogin}>
          <span className="header-menu-item-text">Sign out</span>
          <Icon>
            <ExitToAppIcon />
          </Icon>
        </MenuItem>
      </Menu>
    </div>
  );
};
