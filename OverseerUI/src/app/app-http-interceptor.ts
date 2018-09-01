import { Injectable, Component } from "@angular/core";
import { Router } from "@angular/router";
import {
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent
} from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { LocalStorage } from "ngx-store";
import { MatSnackBar } from "@angular/material";
import { LoaderService } from "./shared/loader.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class OverseerHttpInterceptor implements HttpInterceptor {
    @LocalStorage() activeUser: any;

    constructor(
        private router: Router,
        public snackBar: MatSnackBar,
        private loaderService: LoaderService,
        private translateService: TranslateService
    ) {}

    private displayErrorToast(errorMessage) {
        errorMessage = `errors.${errorMessage}`;
        this.translateService.get(errorMessage).subscribe(translation => {
            if (translation && translation !== errorMessage) {
                this.snackBar.open(translation, "Dismiss", {
                    duration: 3000,
                    panelClass: "error",
                    horizontalPosition: "right"
                })
                    .onAction()
                    .subscribe(() => this.snackBar.dismiss());
            } else {
                this.displayErrorToast("unknown_exception");
            }
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loaderService.start();

        if (this.activeUser !== null) {
            request = request.clone({
                setHeaders: {
                    Authorization: "Bearer " + this.activeUser.token
                }
            });
        }

        return next.handle(request)
            .pipe(tap(() => this.loaderService.stop()))
            .pipe(catchError((errorResponse: HttpErrorResponse) => {
                this.loaderService.stop();

                let errorMessage = "unknown_exception";
                if (!(errorResponse.error instanceof Error)) {
                    switch (errorResponse.status) {
                        case 400:
                            if (errorResponse.error.error) {
                                errorMessage = errorResponse.error.error;

                                this.displayErrorToast(errorMessage);
                                return throwError(errorResponse.error);
                            }
                            break;
                        case 401:
                        case 403:
                            errorMessage = "unauthorized_access";
                            if (this.router.url !== "/login") {
                                this.router.navigate(["/login"]);
                            }
                            break;
                    }

                    this.displayErrorToast(errorMessage);
                    return throwError(errorMessage);
                }
            }));
    }
}
