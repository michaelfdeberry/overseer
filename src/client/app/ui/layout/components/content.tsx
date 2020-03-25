import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../hooks';
import { actions } from '../../../store/actions';
import { PrivateRoute } from '../../common/private-route';
import { ConfigurationPage } from '../../configuration';
import { LoginPage } from '../../login';
import { MonitoringPage } from '../../monitoring';

export const Content: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(state => state.isInitialized);
  const lastNotification = useSelector(state => state.lastNotification)

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  function onNotificationClose() {
    dispatch(actions.layout.clearNotification());
  }

  return (
    <React.Fragment>
      <Switch>
        <PrivateRoute path="/" exact>
          <MonitoringPage />
        </PrivateRoute>
        <Route path="/login" component={LoginPage} />
        <Route path="/configuration" component={ConfigurationPage} />
      </Switch>
      <Snackbar
        open={!!lastNotification}
        autoHideDuration={5000}
        onClose={onNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onNotificationClose} severity={lastNotification.severity} variant="filled" elevation={6}>
          {lastNotification.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};
