import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useDispatch, useSelector } from './hooks';
import { getActiveUser } from './operations/active-user.operations';
import { authorize, requiresInitialSetup } from './operations/local/authorization.operations.local';
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
        const activeUser = getActiveUser();
        if (activeUser) {
          invokeOperation(dispatch, authorize(activeUser.token)).subscribe((activeUser) => {
            dispatch(actions.common.initialize({
              activeUser,
              isInitialized: true,
              isSetup: !requiresSetup,
              isLocalApp: Boolean(__isLocalApp__),
              currentTheme: getCurrentTheme(),
            }));
          });
        } else {
          dispatch(actions.common.initialize({
            isInitialized: true,
            isSetup: !requiresSetup,
            currentTheme: getCurrentTheme(),
            isLocalApp: Boolean(__isLocalApp__)
          }));
        }
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
