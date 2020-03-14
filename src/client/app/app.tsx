import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { coreActions } from './core/store/actions';
import { selectIsAppInitialized } from './core/store/selectors';
import Layout from './layout';

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
