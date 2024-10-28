export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'LOG' | 'WARN' | 'ERROR' | 'FATAL';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  additional?: (string | Record<string, unknown>)[];
};
