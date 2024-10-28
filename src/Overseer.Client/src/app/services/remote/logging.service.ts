import { inject, Injectable } from '@angular/core';
import { LoggingService } from '../logging.service';
import { LogEntry } from '../../models/log-entry.model';
import { HttpClient } from '@angular/common/http';
import { endpointFactory } from './endpoint-factory';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RemoteLoggingService extends LoggingService {
  private getEndpoint = endpointFactory('/api/logging');
  private http = inject(HttpClient);

  protected override saveLogEntry(entry: LogEntry): void {
    this.http.post(this.getEndpoint(), entry).subscribe();
  }

  override download(): Observable<string> {
    return this.http.get<string>(this.getEndpoint());
  }
}
