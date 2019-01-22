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
import { LoaderService } from "./services/loader.service";
import { ErrorHandlerService } from "./services/error-handler.service";

@Injectable()
export class OverseerHttpInterceptor implements HttpInterceptor {
    @LocalStorage() activeUser: any;

    constructor(
        private router: Router,
        private loaderService: LoaderService,
        private errorHandler: ErrorHandlerService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // only intercept local request.
        if (!request.url.startsWith("/")) {
            return next.handle(request);
        }

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
                            if (errorResponse.error.exceptionType && errorResponse.error.exceptionType === "overseer") {
                                errorMessage = errorResponse.error.key;

                                this.errorHandler.handle(errorMessage);
                                return throwError(errorResponse.error);
                            }
                            break;
                        case 401:
                        case 403:
                            if (errorResponse.error === "requiresInitialization=True") {
                                errorMessage = "setup_required";
                                if (this.router.url !== "/configuration/setup") {
                                    this.router.navigate(["/configuration", "setup"]);
                                }
                            } else {
                                errorMessage = "unauthorized_access";
                                if (this.router.url !== "/login") {
                                    this.router.navigate(["login"]);
                                }
                            }
                            break;
                    }

                    this.errorHandler.handle(errorMessage);
                    return throwError(errorMessage);
                }
            }));
    }
}
