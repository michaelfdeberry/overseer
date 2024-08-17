import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorage, LocalStorageService } from 'ngx-store';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from './services/error-handler.service';
import { LoaderService } from './services/loader.service';
import { environment } from '../environments/environment.remote';
import { User } from './models/user.model';

@Injectable()
export class OverseerHttpInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private errorHandler: ErrorHandlerService,
    private localStorageService: LocalStorageService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // only intercept local request.
    if (!request.url.startsWith(environment.apiHost)) {
      return next.handle(request);
    }

    this.loaderService.start();
    const activeUser = this.localStorageService.get('activeUser') as User;
    if (activeUser?.token) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + activeUser.token,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((errorResponse) => {
        this.loaderService.stop();

        let errorMessage = 'unknown_exception';
        if (!(errorResponse.error instanceof Error)) {
          switch (errorResponse.status) {
            case 400:
              if (errorResponse.error.exceptionType === 'overseer') {
                errorMessage = errorResponse.error.message;

                this.errorHandler.handle(errorMessage);
                return throwError(() => new Error(errorResponse.error));
              }
              break;
            case 401:
            case 403:
              if (errorResponse.error === 'requiresInitialization=True') {
                errorMessage = 'setup_required';
                if (this.router.url !== '/configuration/setup') {
                  this.router.navigate(['/configuration', 'setup']);
                }
              } else {
                errorMessage = 'unauthorized_access';

                // the sso component handles redirects if the user
                // isn't authenticated.
                if (this.router.url.startsWith('/sso')) {
                  return throwError(() => new Error(errorMessage));
                }

                if (this.router.url !== '/login') {
                  this.router.navigate(['login']);
                }
              }
              break;
          }
        }

        this.errorHandler.handle(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      tap(() => this.loaderService.stop())
    );
  }
}
