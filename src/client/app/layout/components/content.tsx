import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { PrivateRoute } from '../../core/components/private-route';
import { coreActions } from '../../core/store/actions';
import { selectIsAppInitialized } from '../../core/store/selectors';
import { ConfigurationContainer } from '../../pages/configuration';
import { LoginContainer } from '../../pages/login';
import { MonitoringContainer } from '../../pages/monitoring';
import { AppState } from '../../store';

export const Content: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsAppInitialized);
  const lastErrorMessage = useSelector<AppState>(state => state.core.lastErrorMessage);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  function onErrorClose() {
    dispatch(coreActions.clearLastError());
  }

  return (
    <React.Fragment>
      <Switch>
        <PrivateRoute path="/" exact>
          <MonitoringContainer />
        </PrivateRoute>
        <Route path="/login" component={LoginContainer} />
        <Route path="/configuration" component={ConfigurationContainer} />
      </Switch>
      <Snackbar open={!!lastErrorMessage} autoHideDuration={5000} onClose={onErrorClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={onErrorClose} severity="error" variant="filled" elevation={6}>
          {lastErrorMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};
