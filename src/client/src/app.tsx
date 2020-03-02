import { CssBaseline } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Layout from './layout';

const App: React.FunctionComponent = () => {
    return (
        <Router>
            <CssBaseline />
            <Layout></Layout>
        </Router>
    );
};

export default App;
