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

  toDisplay(includeToken = false): DisplayUser {
    return {
      id: this.id,
      username: this.username,
      sessionLifetime: this.sessionLifetime,
      accessLevel: this.accessLevel,
      isLoggedIn: !this.isTokenExpired(),
      token: includeToken ? this.token : undefined,
    };
  }

  isTokenExpired(): boolean {
    // if the user or token is null it's considered expired
    if (!this.token || this.token === '') return true;

    // if there is no expiration set the, with the presence of a token, the user
    // is configured for indefinite session length
    if (!this.tokenExpiration) return false;

    // otherwise the tokens is expired if it's expiration date is less than the current date
    return this.tokenExpiration < Date.now();
  }
}
