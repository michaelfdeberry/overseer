import { DisplayUser } from '@overseer/common/models';

const activeUserKey = 'active_user';

export function getActiveUser(): DisplayUser {
  const activeUserJson = localStorage.getItem(activeUserKey);
  if (!activeUserJson) return;

  return JSON.parse(activeUserJson);
}

export function setActiveUser(user: DisplayUser): void {
  localStorage.setItem(activeUserKey, JSON.stringify(user));
}

export function clearActiveUser(): void {
  localStorage.removeItem(activeUserKey);
}
