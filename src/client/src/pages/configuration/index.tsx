import { Card, CardContent, Container, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

const ConfigurationTabs: React.FunctionComponent = () => {
    const { pathname } = useLocation();

    if (pathname.indexOf('add') >= 0) return null;
    if (pathname.indexOf('edit') >= 0) return null;
    if (pathname.indexOf('setup') >= 0) return null;

    const [tabValue, setTabValue] = useState(pathname);
    const history = useHistory();

    useEffect(() => {
        return history.listen((location) => setTabValue(location.pathname));
    }, []);

    const navigate = (_: any, value: string) => {
        setTabValue(value);

        if (pathname !== value) {
            history.push(value);
        }
    };

    return (
        <Tabs value={tabValue} onChange={navigate} indicatorColor="primary" textColor="primary" variant="fullWidth">
            <Tab label="Application" value="/configuration" />
            <Tab label="Machines" value="/configuration/machines" />
            <Tab label="Users" value="/configuration/users" />
            <Tab label="About" value="/configuration/about" />
        </Tabs>
    );
};

export const ConfigurationContainer: React.FunctionComponent = () => {
    let { path } = useRouteMatch();

    return (
        <Container>
            <Card>
                <CardContent>
                    <ConfigurationTabs />
                    <div className="tabs-content">
                        <Switch>
                            <Route exact path={path}>
                                Application Settings
                            </Route>
                            <Route path={`${path}/users`}>Users</Route>
                            <Route path={`${path}/users/add`}>Add User</Route>
                            <Route path={`${path}/users/edit/:id`}>Edit User</Route>
                            <Route path={`${path}/machines`}>Machines</Route>
                            <Route path={`${path}/machines/add`}>Add Machine</Route>
                            <Route path={`${path}/machines/edit/:id`}>Edit Machine</Route>
                            <Route path={`${path}/about`}>About</Route>
                        </Switch>
                    </div>
                </CardContent>
            </Card>
        </Container>
    );
};
