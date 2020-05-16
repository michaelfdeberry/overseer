import { DisplayUser } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';

import { clearActiveUser, setActiveUser } from '../active-user.operations';
import { getBearerConfig, getDefaultConfig } from './utilities/request-configs';

export function login(user: DisplayUser): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .post<DisplayUser>('/api/auth/login', user, getDefaultConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        setActiveUser(response.data);
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function logout(): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .delete('/api/auth/logout', getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        clearActiveUser();
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function logoutUser(userId: string): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .post(`/api/auth/logout/${userId}`, {}, getBearerConfig())
      .then((response: AxiosResponse<DisplayUser>) => response.data)
      .then((loggedOutUser) => {
        observer.next(loggedOutUser);
        observer.complete();
      });
  });
}

export function getPreauthenticatedToken(userId: string): Observable<string> {
  return Observable.create((observer: Observer<string>) => {
    axios
      .get(`/api/auth/sso/${userId}`, getBearerConfig())
      .then((response: AxiosResponse<string>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function validatePreauthenticatedToken(token: string): Observable<DisplayUser> {
  return Observable.create((observer: Observer<DisplayUser>) => {
    axios
      .post(`/api/auth/sso`, token, getDefaultConfig())
      .then((response: AxiosResponse<DisplayUser>) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}
