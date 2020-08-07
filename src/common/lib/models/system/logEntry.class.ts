export class LogEntry {
  id?: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: number;
  stack: string;
}
