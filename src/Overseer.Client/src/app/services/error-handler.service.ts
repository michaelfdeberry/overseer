import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18NextPipe } from 'angular-i18next';
import { asyncScheduler, never, Observable, scheduled, throwError } from 'rxjs';
import { LoggingService } from './logging.service';

// Handled exception handler, displays a toast/snackbar
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(
    @Inject(I18NextPipe) private i18NextPipe: I18NextPipe,
    @Inject(MatSnackBar) private snackBar: MatSnackBar,
    @Inject(LoggingService) private loggingService: LoggingService
  ) {}

  handle(error: string | Error): Observable<never> {
    const errorMessage = error instanceof Error ? error.message : error;

    const translation = this.i18NextPipe.transform(`errors.${errorMessage}`);
    if (translation && translation !== errorMessage) {
      if (error !== 'unknown_exception') {
        this.loggingService.logger.error(translation);
      }

      this.snackBar
        .open(translation, 'Dismiss', {
          duration: 3000,
          panelClass: 'error',
          horizontalPosition: 'right',
        })
        .onAction()
        .subscribe(() => this.snackBar.dismiss());
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
