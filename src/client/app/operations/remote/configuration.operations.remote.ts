import { LogEntry, SystemSettings } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';
import { UAParser } from 'ua-parser-js';

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
        const parser = new UAParser();
        const parseResult = parser.getResult();

        observer.next({
          'Application Version': __appVersion__,
          Browser: `${parseResult.browser.name} ${parseResult.browser.version}`,
          'Browser Engine': `${parseResult.engine.name} ${parseResult.engine.version}`,
          'Client Operating System': `${parseResult.os.name} ${parseResult.os.version}`,
          ...response.data
        });
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function writeToLog(logEntry: LogEntry): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    axios
      .put('/api/config/log', logEntry, getDefaultConfig())
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function getLog(): Observable<LogEntry[]> {
  return Observable.create((observer: Observer<LogEntry[]>) => {
    axios
      .get('/api/config/log', getDefaultConfig())
      .then((response: AxiosResponse<LogEntry[]>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}
