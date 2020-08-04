import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks';
import { logout } from '../../operations/local/authentication.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { actions } from '../../store/actions';

export const HeaderMenu: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const activeUser = useSelector((state) => state.activeUser);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = !!anchorEl;

  const openMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (): void => {
    setAnchorEl(null);
  };

  const signOut = (): void => {
    closeMenu();
    invoke(dispatch, logout()).subscribe(() => {
      dispatch(actions.common.clearActiveUser());
      history.push('/login');
    });
  };

  if (!activeUser) {
    return null;
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
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={open}
        onClose={closeMenu}
      >
        {activeUser.accessLevel === AccessLevel.Administrator ? (
          <MenuItem>
            <Link to="/configuration" onClick={closeMenu}>
              <span className="header-menu-item-text">Settings</span>
              <Icon>
                <SettingsIcon />
              </Icon>
            </Link>
          </MenuItem>
        ) : (
          <React.Fragment>
            <MenuItem>
              <Link to="/configuration" onClick={closeMenu}>
                <span className="header-menu-item-text">About</span>
                <Icon>
                  <InfoIcon />
                </Icon>
              </Link>
            </MenuItem>
          </React.Fragment>
        )}
        <MenuItem onClick={signOut}>
          <span className="header-menu-item-text">Sign out</span>
          <Icon>
            <ExitToAppIcon />
          </Icon>
        </MenuItem>
      </Menu>
    </div>
  );
};
