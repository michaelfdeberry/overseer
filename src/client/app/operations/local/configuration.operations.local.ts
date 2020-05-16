import { IndexedDBContext } from '@overseer/common/data/indexeddb/indexeddb-context.class';
import { SystemSettings } from '@overseer/common/models';
import { SystemConfigurationService } from '@overseer/common/services';
import { defer, Observable, of } from 'rxjs';

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
  return of({
    //TODO: get system info
  });
}

//todo: add log function

export function getLog(): Observable<string> {
  throw new Error('TODO: support this');
}
