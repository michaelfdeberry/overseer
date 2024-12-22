export type AccessLevel = 'Readonly' | 'Administrator';

export type User = {
  id?: number;
  username?: string;
  password?: string;
  sessionLifetime?: number;
  token?: string;
  isLoggedIn?: boolean;
  accessLevel?: AccessLevel;
};

export type PersistedUser = {
  id?: number;
  username?: string;
  passwordHash?: string;
  passwordSalt?: string;
  sessionLifetime?: number;
  token?: string;
  tokenExpiration?: number;
  accessLevel?: AccessLevel;
};

export function isTokenExpired(user: PersistedUser): boolean {
  // if the user or token is not defined it's considered expired
  if (!user.token?.trim().length) {
    return true;
  }

  // if there is not session lifetime, the token doesn't expire
  if (!user.sessionLifetime) return false;

  // if there is a session lifetime set, but no expiration date, the token is considered expired
  if (!user.tokenExpiration) return true;

  // otherwise the tokens is expired if it's expiration date is less than the current date
  return Date.now() >= user.tokenExpiration;
}

export function toUser(user: PersistedUser, includeToken?: boolean): User {
  return {
    id: user.id,
    username: user.username,
    sessionLifetime: user.sessionLifetime,
    token: includeToken ? user.token : undefined,
    isLoggedIn: !isTokenExpired(user),
    accessLevel: user.accessLevel,
  };
}
