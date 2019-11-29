import { Injectable } from "@angular/core";
import { NGXLogger, NgxLoggerLevel } from "ngx-logger";
import { LoggingService } from "../logging.service";
import { LocalStorage } from "ngx-store";
import { HttpHeaders } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class RemoteLoggingService implements LoggingService {
    @LocalStorage() activeUser: any;

    get logger() {
        return this.ngxLogger;
    }

    constructor(private ngxLogger: NGXLogger) {
        this.ngxLogger.updateConfig({
            level: NgxLoggerLevel.DEBUG,
            serverLogLevel: NgxLoggerLevel.INFO,
            disableConsoleLogging: true,
            serverLoggingUrl: "/api/logging"
        });

        this.ngxLogger.setCustomHttpHeaders(new HttpHeaders({
            Authorization: "Bearer " + this.activeUser ? this.activeUser.token : ""
        }));
    }
}
