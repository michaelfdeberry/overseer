import { Icon, IconButton, Menu, MenuItem } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { AppState } from '../../store';
import { logout } from '../../store/actions';

export const HeaderMenu: React.FunctionComponent = () => {
    const isAuthenticated = useSelector<AppState>((state) => state.common?.isAuthenticated);
    // if (!isAuthenticated) return null;

    const dispatch = useDispatch();
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = !!anchorEl;
    const configRoute = useRouteMatch('/configuration');

    const openMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const navigateToConfiguration = () => {
        closeMenu();

        if (!configRoute?.isExact) {
            history.push('/configuration');
        }
    };

    const navigateToLogin = () => {
        closeMenu();
        dispatch(logout);
        history.push('/login');
    };

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
