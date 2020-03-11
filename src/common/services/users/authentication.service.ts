import * as bcrypt from 'bcryptjs';

import { DataContext } from '../../data/data-context.class';
import { AccessLevel, DisplayUser, User } from '../../models/users';

export class AuthenticationService {
  constructor(private context: DataContext) {}

  async authenticateUser(credentials: Partial<DisplayUser>): Promise<DisplayUser> {
    if (!credentials.username) throw new Error('invalid_username');
    if (!credentials.password) throw new Error('invalid_password');

    const user = await this.context.users.getByKey(u => u.username.toLowerCase() === credentials.username.toLowerCase());
    const passwordHash = await bcrypt.hash(credentials.password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) throw new Error('invalid_password');

    return await this.authenticate(user);
  }

  async preauthenticate(userId: number): Promise<string | undefined> {
    const user = await this.context.users.getById(userId);
    if (!user) return;
    if (user.accessLevel !== AccessLevel.Readonly) return;

    user.preauthenticatedToken = btoa(await bcrypt.genSalt(16));
    user.preauthenticatedTokeExpiration = Date.now() + 120000;
    await this.context.users.update(user);

    return user.preauthenticatedToken;
  }

  async authenticatePreauthorization(token: string): Promise<DisplayUser | undefined> {
    const user = await this.context.users.getByKey(u => u.preauthenticatedToken === token);
    if (!user) return;
    if (user.preauthenticatedTokeExpiration < Date.now()) return;

    return this.authenticate(user);
  }

  async deauthenticateUser(userId: number): Promise<DisplayUser | undefined> {
    return await this.deauthenticate(await this.context.users.getById(userId));
  }

  async deauthenticateToken(token: string): Promise<DisplayUser | undefined> {
    return await this.deauthenticate(await this.context.users.getByKey(u => u.token === token));
  }

  private async authenticate(user: User): Promise<DisplayUser> {
    if (!user.isTokenExpired()) return user.toDisplay(true);

    user.token = await bcrypt.genSalt(16);
    user.tokenExpiration = user.sessionLifetime ? Date.now() + user.sessionLifetime * 86400 : undefined;
    user.preauthenticatedToken = undefined;
    user.preauthenticatedTokeExpiration = undefined;

    this.context.users.update(user);
    return user.toDisplay(true);
  }

  private async deauthenticate(user: User): Promise<DisplayUser> {
    if (!user) return null;

    user.token = undefined;
    user.tokenExpiration = undefined;
    this.context.users.update(user);

    return user.toDisplay();
  }
}
