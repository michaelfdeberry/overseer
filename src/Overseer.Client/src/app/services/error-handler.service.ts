import { ErrorHandler, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { I18NextService } from 'angular-i18next';
import { Observable, of, throwError } from 'rxjs';
import { LoggingService } from './logging.service';
import { ToastsService } from './toast.service';

// Handled exception handler, displays a toast/snackbar
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private router = inject(Router);
  private toastsService = inject(ToastsService);
  private i18NextService = inject(I18NextService);
  private loggingService = inject(LoggingService);

  handle(error: string | Error): Observable<never> {
    const errorMessage = error instanceof Error ? error.message : error;

    const translation = this.i18NextService.t(`errors.${errorMessage}`);
    if (translation && translation !== errorMessage) {
      if (error !== 'unknown_exception') {
        this.loggingService.error(translation);
      }

      if (this.router.url !== '/setup' && error === 'setup_required') {
        this.router.navigate(['/setup']);
        return of();
      }

      if (error === 'unauthorized_access') {
        if (this.router.url.startsWith('/sso')) {
          return of();
        }

        if (this.router.url !== '/login') {
          this.router.navigate(['login']);
          return of();
        }
      }
      this.toastsService.show({
        message: translation,
        type: 'error',
      });
      console.error(translation);
    } else {
      this.loggingService.error(error);
      this.handle('unknown_exception');
    }

    return throwError(() => error);
  }
}

// Global unhandled exception handler
@Injectable({ providedIn: 'root' })
export class OverseerErrorHandler implements ErrorHandler {
  private loggingService = inject(LoggingService);
  private errorHandlerService = inject(ErrorHandlerService);

  handleError(error: any): void {
    this.errorHandlerService.handle(error);
    this.loggingService.error(error);
  }
}
