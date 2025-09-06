import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LogEntry, LogLevel } from '../models/log-entry.model';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export abstract class LoggingService {
  private getEndpoint = endpointFactory('/api/logging');
  private http = inject(HttpClient);

  public trace(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('TRACE', message, additional);
  }

  public debug(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('DEBUG', message, additional);
  }

  public info(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('INFO', message, additional);
  }

  public log(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('LOG', message, additional);
  }

  public warn(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('WARN', message, additional);
  }

  public error(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('ERROR', message, additional);
  }

  public fatal(message: string | Error, ...additional: (string | Record<string, unknown>)[]): void {
    this.writeToLog('FATAL', message, additional);
  }

  private writeToLog(level: LogLevel, message: string | Error, additional?: (string | Record<string, unknown>)[]): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message: message instanceof Error ? `${message.message}\n${message.stack}` : message.toString(),
      additional,
    };
    this.saveLogEntry(entry);
  }

  private saveLogEntry(entry: LogEntry): void {
    this.http.post(this.getEndpoint(), entry).subscribe();
  }

  download(): Observable<string> {
    return this.http.get<{ content: string }>(this.getEndpoint()).pipe(map((response) => response.content));
  }
}
