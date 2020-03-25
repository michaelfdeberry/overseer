import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { coreActions } from './core/store/actions';
import { selectIsAppInitialized } from './core/store/selectors';
import { useDispatch, useSelector } from './hooks';
import Layout from './ui/layout';

const App: React.FunctionComponent = () => {
  const isInitialized = useSelector(selectIsAppInitialized);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!isInitialized) {
      dispatch(coreActions.initialize());
    }
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
