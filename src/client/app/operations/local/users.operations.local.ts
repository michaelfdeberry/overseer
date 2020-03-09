import { DisplayUser } from 'overseer_lib';
import { getLocalStorageDataContext } from 'overseer_lib/data';
import { UserConfigurationService } from 'overseer_lib/services';
import { defer, Observable } from 'rxjs';

async function withUserConfigurationService<T>(execute: (service: UserConfigurationService) => Promise<T>): Promise<T> {
  const context = await getLocalStorageDataContext();
  const service = new UserConfigurationService(context);
  return await execute(service);
}

export function getUsers(): Observable<DisplayUser[]> {
  return defer(() => withUserConfigurationService(service => service.getUsers()));
}

export function getUser(userId: number): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService(service => service.getUser(userId)));
}

export function createUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService(service => service.createUser(user)));
}

export function updateUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService(service => service.updateUser(user)));
}

export function deleteUser(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService(service => service.deleteUser(user)));
}

export function changePassword(user: DisplayUser): Observable<DisplayUser> {
  return defer(() => withUserConfigurationService(service => service.changePassword(user)));
}
