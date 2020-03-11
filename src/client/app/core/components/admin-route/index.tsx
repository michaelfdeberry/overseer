import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { selectActiveUser, selectIsAuthenticated, selectIsInitialSetupRequired } from '../../store/selectors';

export const AdminRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const isInitialSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const activeUser = useSelector(selectActiveUser);

  function renderRoute(): React.ReactNode {
    if (isInitialSetupRequired) {
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }

    if (activeUser.accessLevel !== AccessLevel.Administrator) {
      return <Redirect to="/" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
