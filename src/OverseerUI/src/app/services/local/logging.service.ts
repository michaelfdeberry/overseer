import { Injectable } from "@angular/core";
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface } from "ngx-logger";
import { LoggingService } from "../logging.service";
import { LocalStorage } from "ngx-store";
import { LogStorageService } from "./storage/log-storage.service";


class OverseerMonitor implements NGXLoggerMonitor {
    constructor(private logStorage: LogStorageService) {
    }

    onLog(logObject: NGXLogInterface): void {
        this.logStorage.write(logObject);
    }
}

@Injectable({ providedIn: "root" })
export class LocalLoggingService implements LoggingService {
    @LocalStorage() activeUser: any;

    get logger() {
        return this.ngxLogger;
    }

    constructor(private ngxLogger: NGXLogger, logStorage: LogStorageService) {
        ngxLogger.registerMonitor(new OverseerMonitor(logStorage));
    }
}
