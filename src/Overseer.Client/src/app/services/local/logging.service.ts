import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LogEntry } from '../../models/log-entry.model';
import { LoggingService } from '../logging.service';
import { IndexedStorageService } from './indexed-storage.service';

@Injectable({ providedIn: 'root' })
export class LocalLoggingService extends LoggingService {
  private indexedStorage = inject(IndexedStorageService);

  override download(): Observable<string> {
    return this.indexedStorage.logging.getAll().pipe(
      map((logEntries) => {
        return logEntries
          .map((e) => {
            return `${e.timestamp} - ${e.level}: ${e.message}`;
          })
          .join('\n');
      })
    );
  }

  protected override saveLogEntry(entry: LogEntry): void {
    this.indexedStorage.logging.add(entry).subscribe();
  }
}
