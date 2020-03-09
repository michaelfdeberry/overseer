import * as React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { selectIsAuthenticated, selectIsInitialSetupRequired } from '../../store/selectors';

export const PrivateRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const isInitialSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  function renderRoute(): React.ReactNode {
    if (isInitialSetupRequired) {
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
