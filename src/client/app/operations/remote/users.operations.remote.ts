import { DisplayUser } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';

import { getBearerConfig } from './utilities/request-configs';

export function getUsers(): Observable<DisplayUser[]> {
  return Observable.create((observer: Observer<DisplayUser[]>) => {
    axios
      .get('/api/users', getBearerConfig())
      .then((response: AxiosResponse<DisplayUser[]>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function getUser(userId: string): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .get(`/api/users/${userId}`, getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function createUser(user: DisplayUser): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .put('/api/users', user, getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function updateUser(user: DisplayUser): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .post('/api/users', user, getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function deleteUser(user: DisplayUser): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios.delete(`/api/users/${user.id}`, getBearerConfig()).then((response: AxiosResponse<DisplayUser>) => {
      observer.next(response.data);
      observer.complete();
    });
  });
}

export function changePassword(user: DisplayUser): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .post('/api/users/password', user, getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}
