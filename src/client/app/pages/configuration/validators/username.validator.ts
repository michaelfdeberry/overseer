export function isUsernameValid(username: string, excludeUndefined: boolean = true): boolean {
  return (username === undefined && excludeUndefined) || username !== '';
}
