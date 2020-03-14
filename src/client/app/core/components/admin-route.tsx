import { errorMessageMap } from '@overseer/common/error-messages';
import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { coreActions } from '../store/actions';
import { selectActiveUser, selectIsAuthenticated, selectIsInitialSetupRequired } from '../store/selectors';

export const AdminRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const dispatch = useDispatch();
  const isInitialSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const activeUser = useSelector(selectActiveUser);

  function renderRoute(): React.ReactNode {
    if (isInitialSetupRequired) {
      dispatch(coreActions.logError(errorMessageMap.setup_required));
      return <Redirect to="/configuration/setup" />;
    }

    if (!isAuthenticated) {
      dispatch(coreActions.logError(errorMessageMap.unauthorized_access));
      return <Redirect to="/login" />;
    }

    if (activeUser.accessLevel !== AccessLevel.Administrator) {
      return <Redirect to="/" />;
    }

    return children;
  }

  return <Route {...rest} render={renderRoute} />;
};
