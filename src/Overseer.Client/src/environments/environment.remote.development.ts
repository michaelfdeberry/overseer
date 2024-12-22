import { versions } from './versions';

export const environment = {
  ...versions,
  production: false,
  apiHost: 'https://localhost:52375',
};
