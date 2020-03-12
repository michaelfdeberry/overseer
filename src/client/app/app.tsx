import * as React from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { coreActions } from './core/store/state';
import Layout from './layout';

const App: React.FunctionComponent = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(coreActions.initialize());
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
