import { ErrorHandler, inject, Injectable } from '@angular/core';
import { I18NextService } from 'angular-i18next';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from './logging.service';
import { ToastsService } from './toast.service';

// Handled exception handler, displays a toast/snackbar
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private i18NextService = inject(I18NextService);
  private loggingService = inject(LoggingService);
  private toastsService = inject(ToastsService);

  handle(error: string | Error): Observable<never> {
    const errorMessage = error instanceof Error ? error.message : error;

    const translation = this.i18NextService.t(`errors.${errorMessage}`);
    if (translation && translation !== errorMessage) {
      if (error !== 'unknown_exception') {
        this.loggingService.error(translation);
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
  constructor(private loggingService: LoggingService) {}

  handleError(error: any): void {
    console.error(error);
    this.loggingService.error(error);
  }
}
