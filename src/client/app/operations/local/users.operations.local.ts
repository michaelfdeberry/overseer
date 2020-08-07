import { IndexedDBContext } from '@overseer/common/lib/data/indexeddb/indexeddb-context.class';
import { DisplayUser } from '@overseer/common/lib/models';
import { UserConfigurationService } from '@overseer/common/lib/services';
import { defer, Observable } from 'rxjs';

async function withUserConfigurationService<T>(execute: (service: UserConfigurationService) => Promise<T>): Promise<T> {
  const context = new IndexedDBContext();
  const service = new UserConfigurationService(context);
  return await execute(service);
}

export function getUsers(): Observable<DisplayUser[]> {
  return defer(() => withUserConfigurationService((service) => service.getUsers()));
}

export function getUser(userId: string): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService((service) => service.getUser(userId)));
}

export function createUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService((service) => service.createUser(user)));
}

export function updateUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService((service) => service.updateUser(user)));
}

export function deleteUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService((service) => service.deleteUser(user.id)));
}

export function changePassword(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService((service) => service.changePassword(user)));
}
