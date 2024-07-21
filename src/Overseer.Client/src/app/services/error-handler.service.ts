import { throwError, Observable } from "rxjs";
import { Injectable, ErrorHandler } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoggingService } from "./logging.service";

// Handled exception handler, displays a toast/snackbar
@Injectable({ providedIn: "root" })
export class ErrorHandlerService {

    constructor(
        private translateService: TranslateService,
        private snackBar: MatSnackBar,
        private loggingService: LoggingService
    ) {}

    handle(error): Observable<never> {
        const errorMessage = error instanceof Error ? error.message : error;

        this.translateService.get(`errors.${errorMessage}`).subscribe(translation => {
            if (translation && translation !== errorMessage) {
                if (error !== "unknown_exception") {
                    this.loggingService.logger.error(translation);
                }

                this.snackBar.open(translation, "Dismiss", {
                    duration: 3000,
                    panelClass: "error",
                    horizontalPosition: "right"
                })
                    .onAction()
                    .subscribe(() => this.snackBar.dismiss());
            } else {
                this.loggingService.logger.error(error);
                this.handle("unknown_exception");
            }
        });

        return throwError(error);
    }
}

// Global unhandled exception handler
@Injectable({ providedIn: "root" })
export class OverseerErrorHandler implements ErrorHandler {
    constructor(private loggingService: LoggingService) {
    }

    handleError(error: any): void {
        this.loggingService.logger.error(error);
    }
}
