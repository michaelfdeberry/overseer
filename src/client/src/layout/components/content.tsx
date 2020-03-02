import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ConfigurationContainer } from '../../pages/configuration';
import { LoginContainer } from '../../pages/login';
import { MonitoringContainer } from '../../pages/monitoring';

export const Content: React.FunctionComponent = () => {
    return (
        <Switch>
            <Route path="/" component={MonitoringContainer} exact />
            <Route path="/login" component={LoginContainer} />
            <Route path="/configuration" component={ConfigurationContainer} />
        </Switch>
    );
};
