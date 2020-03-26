import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useDispatch, useSelector } from './hooks';
import { getActiveUser } from './operations/active-user.operations';
import { requiresInitialSetup } from './operations/local/authorization.operations.local';
import { invokeOperation } from './operations/operation-invoker';
import { getCurrentTheme } from './operations/theme.operations';
import { actions } from './store/actions';
import Layout from './ui/layout';

const App: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(state => state.isInitialized);

  React.useEffect(() => {
    if (!isInitialized) {
      invokeOperation(dispatch, requiresInitialSetup()).subscribe((requiresSetup) => {
        dispatch(actions.common.initialize({ isInitialized: true, isSetup: !requiresSetup, currentTheme: getCurrentTheme(), activeUser: getActiveUser() }));
      });
    }
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
