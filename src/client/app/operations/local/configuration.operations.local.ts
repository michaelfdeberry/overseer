import { IndexedDBContext } from '@overseer/common/lib/data/indexeddb/indexeddb-context.class';
import { LogEntry, SystemSettings } from '@overseer/common/lib/models';
import { SystemConfigurationService } from '@overseer/common/lib/services';
import { defer, Observable, of } from 'rxjs';
import { UAParser } from 'ua-parser-js';

async function withSystemConfigurationService<T>(execute: (service: SystemConfigurationService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new SystemConfigurationService(context);
  return await execute(service);
}

export function getSettings(): Observable<SystemSettings> {
  return defer(() => withSystemConfigurationService((service) => service.getSystemSetting()));
}

export function updateSettings(settings: SystemSettings): Observable<void> {
  return defer(() => withSystemConfigurationService((service) => service.updateSystemSettings(settings)));
}

export function getApplicationInfo(): Observable<{ [key: string]: string }> {
  const parser = new UAParser();
  const parseResult = parser.getResult();

  return of({
    'Application Version': __appVersion__,
    Browser: `${parseResult.browser.name} ${parseResult.browser.version}`,
    'Browser Engine': `${parseResult.engine.name} ${parseResult.engine.version}`,
    'Operating System': `${parseResult.os.name} ${parseResult.os.version}`
  });
}

export function writeToLog(logEntry: LogEntry): Observable<void> {
  return defer(() => withSystemConfigurationService((service) => service.writeToLog(logEntry)));
}

export function getLog(): Observable<LogEntry[]> {
  return defer(() => withSystemConfigurationService((service) => service.readFromLog()));
}
