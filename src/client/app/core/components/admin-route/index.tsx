import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { selectActiveUser, selectIsAuthenticated, selectIsInitialSetupRequired } from '../../store/selectors';
import { coreActions } from '../../store/state';

export const AdminRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const dispatch = useDispatch();
  const isInitialSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const activeUser = useSelector(selectActiveUser);

  function renderRoute(): React.ReactNode {
    if (isInitialSetupRequired) {
      dispatch(coreActions.displayError('setup Required!'));
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      dispatch(coreActions.displayError('Unauthorized Access Attempted!'));
      return <Redirect to="/login" />;
    }

    if (activeUser.accessLevel !== AccessLevel.Administrator) {
      return <Redirect to="/" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
