import initializeIntegration from '@overseer/common/integration/initialize-integration.function';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Layout from './components/layout';
import { useDispatch, useSelector } from './hooks';
import { authorize, requiresInitialSetup } from './operations/local/authorization.operations.local';
import { invoke } from './operations/operation-invoker';
import { getCurrentTheme } from './operations/theme.operations';
import { actions } from './store/actions';

const App: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(state => state.isInitialized);

  React.useEffect(() => {
    initializeIntegration();

    if (!isInitialized) {
      invoke(dispatch, requiresInitialSetup()).subscribe(requiresSetup => {
        invoke(dispatch, authorize()).subscribe(activeUser => {
          dispatch(
            actions.common.initialize({
              activeUser,
              isInitialized: true,
              isSetup: !requiresSetup,
              // eslint-disable-next-line no-undef
              isLocalApp: __isLocalApp__,
              currentTheme: getCurrentTheme()
            })
          );
        });
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
