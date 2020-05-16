import * as React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks';
import { actions } from '../../store/actions';

export const PrivateRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const dispatch = useDispatch();
  const isSetup = useSelector((state) => state.isSetup);
  const isAuthenticated = !!useSelector((state) => state.activeUser);

  function renderRoute(): React.ReactNode {
    if (!isSetup) {
      dispatch(actions.layout.notifyError('setup_required'));
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      dispatch(actions.layout.notifyError('unauthorized_access'));
      return <Redirect to="/login" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
