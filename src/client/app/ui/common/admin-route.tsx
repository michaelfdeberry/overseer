import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks';
import { actions } from '../../store/actions';


export const AdminRoute: React.FunctionComponent<RouteProps> = ({ children, ...rest }: RouteProps) => {
  const dispatch = useDispatch();
  const isSetup = useSelector(state => state.isSetup);
  const activeUser = useSelector(state => state.activeUser);

  const renderRoute = (): React.ReactNode => {
    if (!isSetup) {
      dispatch(actions.layout.notifyError('setup_required'));
      return <Redirect to="/configuration/setup" />;
    }

    if (!activeUser) {
      dispatch(actions.layout.notifyError('unauthorized_access'));
      return <Redirect to="/login" />;
    }

    if (activeUser.accessLevel !== AccessLevel.Administrator) {
      return <Redirect to="/" />;
    }

    return children;
  };

  return <Route {...rest} render={renderRoute} />;
};
