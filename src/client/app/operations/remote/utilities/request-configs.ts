import { AxiosRequestConfig } from 'axios';
import { merge } from 'lodash/fp';

import { getActiveUser } from '../../active-user.operations';

export function getDefaultConfig(): AxiosRequestConfig {
  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  };
}

export function getBearerConfig(): AxiosRequestConfig {
  return merge(getDefaultConfig, { headers: { Authorization: `Bearer ${getActiveUser()?.token || ''}` } });
}
