import { AppBar, Toolbar, Typography } from '@material-ui/core';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { HeaderMenu } from './header-menu';

export const Header: React.FunctionComponent = () => {
    const history = useHistory();
    const match = useRouteMatch('/');

    return (
        <AppBar className="header" position="relative">
            <Toolbar>
                <div className="header-title" onClick={() => !match.isExact && history.push('/')}>
                    <Typography variant="h6">Overseer</Typography>
                </div>
                <HeaderMenu></HeaderMenu>
            </Toolbar>
        </AppBar>
    );
};
