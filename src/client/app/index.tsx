import '../scss/styles.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app';
import { Store } from './store';

ReactDOM.render(
  <Store>
    <App />
  </Store>,
  document.getElementById('root')
);
