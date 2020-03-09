import { Card, CardContent, Container, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { AdminRoute } from '../../core/components/admin-route';
import { SetupPage } from './components/setup';

const ConfigurationTabs: React.FunctionComponent = () => {
  const { pathname } = useLocation();

  if (pathname.indexOf('add') >= 0) return null;
  if (pathname.indexOf('edit') >= 0) return null;
  if (pathname.indexOf('setup') >= 0) return null;

  const [tabValue, setTabValue] = useState(pathname);
  const history = useHistory();

  useEffect(() => {
    return history.listen(location => setTabValue(location.pathname));
  }, []);

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
    <Container>
      <Card>
        <CardContent>
          <ConfigurationTabs />
          <div className="tabs-content">
            <Switch>
              <AdminRoute exact path={path}>
                System Settings
              </AdminRoute>
              <AdminRoute path={`${path}/users`}>Users</AdminRoute>
              <AdminRoute path={`${path}/users/add`}>Add User</AdminRoute>
              <AdminRoute path={`${path}/users/edit/:id`}>Edit User</AdminRoute>
              <AdminRoute path={`${path}/machines`}>Machines</AdminRoute>
              <AdminRoute path={`${path}/machines/add`}>Add Machine</AdminRoute>
              <AdminRoute path={`${path}/machines/edit/:id`}>Edit Machine</AdminRoute>
              <AdminRoute path={`${path}/about`}>About</AdminRoute>
              <Route path={`${path}/setup`}>
                <SetupPage />
              </Route>
            </Switch>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};
