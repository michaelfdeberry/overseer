import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { useSelector } from '../../hooks';
import { AdminRoute } from '../common/admin-route';
import { PrivateRoute } from '../common/private-route';
import { MachinesPage } from './machines';
import { CreateMachinePage } from './machines/create-machine-page';
import { UpdateMachinePage } from './machines/update-machine-page';
import { SetupPage } from './setup';
import { SystemSettingsContainer } from './system';
import { AboutPage } from './system/about-page';
import { UsersPage } from './users';
import { CreateUserPage } from './users/create-user-page';
import { UpdateUserPage } from './users/update-user-page';

const ConfigurationTabs: React.FunctionComponent = () => {
  const isValidTabPath = (path): boolean => {
    if (path.indexOf('add') >= 0) return false;
    if (path.indexOf('edit') >= 0) return false;
    if (path.indexOf('setup') >= 0) return false;
    return true;
  };

  const history = useHistory();
  const { pathname } = useLocation();
  const [tabValue, setTabValue] = useState(isValidTabPath(pathname) ? pathname : null);
  const activeUser = useSelector((state) => state.activeUser);

  const navigate = (_: React.MouseEvent, value: string): void => {
    setTabValue(value);

    if (pathname !== value) {
      history.push(value);
    }
  };

  useEffect(() => {
    return history.listen((location) => {
      if (isValidTabPath(location.pathname)) {
        setTabValue(location.pathname);
      }
    });
  }, []);

  if (!activeUser) return null;
  if (!isValidTabPath(pathname)) return null;

  return (
    <Tabs value={tabValue} onChange={navigate} indicatorColor="primary" textColor="primary" variant="fullWidth">
      <Tab label="Application" value="/configuration" />
      <Tab label="Machines" value="/configuration/machines" />
      <Tab label="Users" value="/configuration/users" />
      <Tab label="About" value="/configuration/about" />
    </Tabs>
  );
};

export const ConfigurationPage: React.FunctionComponent = () => {
  const { path } = useRouteMatch();

  return (
    <Container className="configuration" maxWidth="md">
      <Card>
        <CardContent>
          <ConfigurationTabs />
          <Switch>
            <AdminRoute exact path={path}>
              <SystemSettingsContainer />
            </AdminRoute>
            <AdminRoute path={`${path}/machines/add`}>
              <CreateMachinePage />
            </AdminRoute>
            <AdminRoute path={`${path}/machines/edit/:id`}>
              <UpdateMachinePage />
            </AdminRoute>
            <AdminRoute path={`${path}/machines`}>
              <MachinesPage />
            </AdminRoute>
            <AdminRoute path={`${path}/users/add`}>
              <CreateUserPage />
            </AdminRoute>
            <AdminRoute path={`${path}/users/edit/:id`}>
              <UpdateUserPage />
            </AdminRoute>
            <AdminRoute path={`${path}/users`}>
              <UsersPage />
            </AdminRoute>
            <PrivateRoute path={`${path}/about`}>
              <AboutPage />
            </PrivateRoute>
            <Route path={`${path}/setup`}>
              <SetupPage />
            </Route>
          </Switch>
        </CardContent>
      </Card>
    </Container>
  );
};
