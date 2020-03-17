import { AccessLevel } from './access-level.enum';
import { DisplayUser } from './display-user.interface';

export class User {
  id?: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  accessLevel: AccessLevel;
  sessionLifetime?: number;
  token?: string;
  tokenExpiration?: number;
  preauthenticatedToken?: string;
  preauthenticatedTokeExpiration: number;

  constructor(options?: Partial<User>) {
    Object.assign(this, options || {});
  }

  static toDisplay(user: User, includeToken = false): DisplayUser {
    return {
      id: user.id,
      username: user.username,
      sessionLifetime: user.sessionLifetime,
      accessLevel: user.accessLevel,
      isLoggedIn: !User.isTokenExpired(user),
      token: includeToken ? user.token : undefined,
    };
  }

  static isTokenExpired(user: User): boolean {
    // if the user or token is null it's considered expired
    if (!user.token || user.token === '') return true;

    // if there is no expiration set the, with the presence of a token, the user
    // is configured for indefinite session length
    if (!user.tokenExpiration) return false;

    // otherwise the tokens is expired if it's expiration date is less than the current date
    return user.tokenExpiration < Date.now();
  }
}
