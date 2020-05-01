import { SystemSettings } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';

import { getBearerConfig, getDefaultConfig } from './utilities/request-configs';

export function getSettings(): Observable<SystemSettings> {
  return Observable.create((observer: Observer<SystemSettings>) => {
    axios
      .get('/api/config', getBearerConfig())
      .then((response: AxiosResponse<SystemSettings>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => {
        observer.error(error);
      });
  });
}

export function updateSettings(settings: SystemSettings): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    axios
      .post<SystemSettings>('/api/config', settings, getBearerConfig())
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function getApplicationInfo(): Observable<{ [key: string]: string }> {
  return Observable.create((observer: Observer<{ [key: string]: string }>) => {
    axios
      .get('/api/config/about', getDefaultConfig())
      .then((response: AxiosResponse<{ [key: string]: string }>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

//todo: add certificate support
//todo: add log function

export function getLog(): Observable<string> {
  throw new Error('TODO: support this');
}
