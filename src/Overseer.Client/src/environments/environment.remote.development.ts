import { versions } from './versions';

export const environment = {
  ...versions,
  production: false,
  apiHost: 'http://localhost:9000',
};
