import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { coreActions } from '../store/actions';
import { selectIsAuthenticated, selectIsInitialSetupRequired } from '../store/selectors';

export const PrivateRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const dispatch = useDispatch();
  const isInitialSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  function renderRoute(): React.ReactNode {
    if (isInitialSetupRequired) {
      dispatch(coreActions.logError('setup_required'));
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      dispatch(coreActions.logError('unauthorized_access'));
      return <Redirect to="/login" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
