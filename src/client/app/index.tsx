import '../scss/styles.scss';

import initializeIntegration from '@overseer/common/integration/initialize-integration.function';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './app';
import store from './store';

initializeIntegration();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
