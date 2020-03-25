import '../scss/styles.scss';

import initializeIntegration from '@overseer/common/integration/initialize-integration.function';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app';
import { Store } from './store';

initializeIntegration();

ReactDOM.render(
  <Store>
    <App />
  </Store>,
  document.getElementById('root')
);
