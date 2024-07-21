import { Injectable } from "@angular/core";
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface } from "ngx-logger";
import { LoggingService } from "../logging.service";
import { LocalStorage } from "ngx-store";
import { IndexedStorageService } from "./indexed-storage.service";


class OverseerMonitor implements NGXLoggerMonitor {
    constructor(private storage: IndexedStorageService) {
    }

    onLog(logObject: NGXLogInterface): void {
        this.storage.logging.add(logObject);
    }
}

@Injectable({ providedIn: "root" })
export class LocalLoggingService implements LoggingService {
    @LocalStorage() activeUser: any;

    get logger() {
        return this.ngxLogger;
    }

    constructor(private ngxLogger: NGXLogger, private storage: IndexedStorageService) {
        this.ngxLogger.registerMonitor(new OverseerMonitor(this.storage));
    }
}
