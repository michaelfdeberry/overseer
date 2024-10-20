import { ErrorHandler, inject, Injectable } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from './logging.service';
import { ToastsService } from './toast.service';

// Handled exception handler, displays a toast/snackbar
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private i18NextPipe = inject(I18NextPipe);
  private loggingService = inject(LoggingService);
  private toastService = inject(ToastsService);

  handle(error: string | Error): Observable<never> {
    const errorMessage = error instanceof Error ? error.message : error;

    const translation = this.i18NextPipe.transform(`errors.${errorMessage}`);
    if (translation && translation !== errorMessage) {
      if (error !== 'unknown_exception') {
        this.loggingService.logger.error(translation);
      }

      this.toastService.show({
        message: translation,
        type: 'error',
      });
      console.error(translation);
    } else {
      this.loggingService.logger.error(error);
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
    this.loggingService.logger.error(error);
  }
}
