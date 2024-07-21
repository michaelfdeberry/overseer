import { Injectable } from "@angular/core";
import { NGXLogger, NgxLoggerLevel } from "ngx-logger";
import { LoggingService } from "../logging.service";

@Injectable({ providedIn: "root" })
export class RemoteLoggingService implements LoggingService {
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
    }
}
