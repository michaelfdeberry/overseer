import { Injectable } from '@angular/core';
import { INGXLoggerMetadata, INGXLoggerMonitor, NGXLogger } from 'ngx-logger';
import { LoggingService } from '../logging.service';
import { IndexedStorageService } from './indexed-storage.service';

class OverseerMonitor implements INGXLoggerMonitor {
  constructor(private storage: IndexedStorageService) {}

  onLog(logObject: INGXLoggerMetadata): void {
    this.storage.logging.add(logObject);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalLoggingService implements LoggingService {
  get logger() {
    return this.ngxLogger;
  }

  constructor(
    private ngxLogger: NGXLogger,
    private storage: IndexedStorageService
  ) {
    this.ngxLogger.registerMonitor(new OverseerMonitor(this.storage));
  }
}
