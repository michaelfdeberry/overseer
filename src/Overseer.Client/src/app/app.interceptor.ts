import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { User } from './models/user.model';
import { ErrorHandlerService } from './services/error-handler.service';
import { LocalStorageService } from './services/local-storage.service';

export function overseerInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);
  const localStorageService = inject(LocalStorageService);

  // only intercept overseer api request.
  if (!request.url.startsWith(`${environment.apiHost}/api`)) {
    return next(request);
  }

  const activeUser = localStorageService.get('activeUser') as User;
  if (activeUser?.token) {
    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + activeUser.token,
      },
    });
  }

  return next(request).pipe(
    catchError((errorResponse) => {
      let errorMessage = 'unknown_exception';
      if (!(errorResponse.error instanceof Error)) {
        switch (errorResponse.status) {
          case 400:
            if (errorResponse.error.exceptionType === 'overseer') {
              errorMessage = errorResponse.error.message;

              errorHandler.handle(errorMessage);
              return throwError(() => new Error(errorResponse.error));
            }
            break;
          case 401:
          case 403:
            if (errorResponse.error === 'requiresInitialization=True') {
              errorMessage = 'setup_required';
              if (router.url !== '/setup') {
                router.navigate(['setup']);
              }
            } else {
              errorMessage = 'unauthorized_access';
              if (router.url.startsWith('/sso')) {
                return throwError(() => new Error(errorMessage));
              }

              if (router.url !== '/login') {
                router.navigate(['login']);
              }
            }
            break;
          default:
            errorMessage = 'unknown_exception';
        }
      }
      errorHandler.handle(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}
