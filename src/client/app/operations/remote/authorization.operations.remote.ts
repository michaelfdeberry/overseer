import { DisplayUser } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';

import { getBearerConfig, getDefaultConfig } from './utilities/request-configs';

export function requiresInitialSetup(): Observable<boolean> {
  return Observable.create((observer: Observer<boolean>) => {
    axios
      .get('/api/auth/setup', getDefaultConfig())
      .then(() => {
        observer.next(false);
        observer.complete();
      })
      .catch(() => {
        observer.next(true);
        observer.complete();
      });
  });
}

export function authorize(): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .get('/api/auth', getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch(() => {
        observer.next(null);
        observer.complete();
      });
  });
}
