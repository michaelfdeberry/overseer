import { throwError, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material";

@Injectable({ providedIn: "root" })
export class ErrorHandlerService {

    constructor(
        private translateService: TranslateService,
        private snackBar: MatSnackBar
    ) {}

    handle(error): Observable<never> {
        const errorMessage = error instanceof Error ? error.message : error;
        this.translateService.get(`errors.${errorMessage}`).subscribe(translation => {
            if (translation && translation !== errorMessage) {
                this.snackBar.open(translation, "Dismiss", {
                    duration: 3000,
                    panelClass: "error",
                    horizontalPosition: "right"
                })
                    .onAction()
                    .subscribe(() => this.snackBar.dismiss());
            } else {
                this.handle("unknown_exception");
            }
        });

        return throwError(error);
    }
}
