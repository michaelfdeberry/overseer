import { Card, CardContent, Container, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { AdminRoute } from '../../core/components/admin-route';
import { SetupPage } from './components/setup';
import { SystemSettingsContainer } from './components/system';
import { UsersContainer } from './components/users';

const ConfigurationTabs: React.FunctionComponent = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [tabValue, setTabValue] = useState(pathname);

  function isValidTabPath(path) {
    if (path.indexOf('add') >= 0) return false;
    if (path.indexOf('edit') >= 0) return false;
    if (path.indexOf('setup') >= 0) return false;
    return true;
  }

  useEffect(() => {
    return history.listen(location => {
      if (isValidTabPath(location.pathname)) {
        setTabValue(location.pathname);
      }
    });
  }, []);

  if (!isValidTabPath(pathname)) return null;

  function navigate(_: React.MouseEvent, value: string): void {
    setTabValue(value);

    if (pathname !== value) {
      history.push(value);
    }
  }

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
  const { path } = useRouteMatch();

  return (
    <Container className="configuration">
      <Card>
        <CardContent>
          <ConfigurationTabs />
          <Switch>
            <AdminRoute exact path={path}>
              <SystemSettingsContainer />
            </AdminRoute>
            <AdminRoute path={`${path}/machines/add`}>Add Machine</AdminRoute>
            <AdminRoute path={`${path}/machines/edit/:id`}>Edit Machine</AdminRoute>
            <AdminRoute path={`${path}/machines`}>Machines</AdminRoute>
            <AdminRoute path={`${path}/users/add`}>Add User</AdminRoute>
            <AdminRoute path={`${path}/users/edit/:id`}>Edit User</AdminRoute>
            <AdminRoute path={`${path}/users`}>
              <UsersContainer />
            </AdminRoute>
            <AdminRoute path={`${path}/about`}>About</AdminRoute>
            <Route path={`${path}/setup`}>
              <SetupPage />
            </Route>
          </Switch>
        </CardContent>
      </Card>
    </Container>
  );
};
