import { Injectable } from '@angular/core';
import { LogEntry, LogLevel } from '../models/log-entry.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class LoggingService {
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

  abstract download(): Observable<string>;

  protected abstract saveLogEntry(entry: LogEntry): void;

  private writeToLog(level: LogLevel, message: string | Error, additional?: (string | Record<string, unknown>)[]): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message: message instanceof Error ? `${message.message}\n${message.stack}` : message.toString(),
      additional,
    };
    this.saveLogEntry(entry);
  }
}
