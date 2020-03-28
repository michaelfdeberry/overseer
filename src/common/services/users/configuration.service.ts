import * as bcrypt from 'bcryptjs';

import { DataContext } from '../../data/data-context.class';
import { AccessLevel, DisplayUser, User } from '../../models/users';

export class UserConfigurationService {
  constructor(private context: DataContext) {}

  async getUsers(): Promise<DisplayUser[]> {
    const users = await this.context.users.getAll();
    return users.map(u => u.toDisplay());
  }

  async getUser(userId: string): Promise<DisplayUser> {
    const user = await this.context.users.getById(userId);
    return user.toDisplay();
  }

  async createUser(user: DisplayUser): Promise<DisplayUser> {
    if (!user) throw new Error('invalid_user');
    if (!user.username) throw new Error('invalid_username');
    if (!user.password) throw new Error('invalid_password');
    if (await this.context.users.getByKey(u => u.username.toLowerCase() === user.username.toLowerCase())) throw new Error('unavailable_username');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);
    const pUser = new User({
      username: user.username,
      passwordHash: hash,
      passwordSalt: salt,
      sessionLifetime: user.sessionLifetime,
      accessLevel: user.accessLevel,
    });

    await this.context.users.add(pUser);
    return pUser.toDisplay();
  }

  async updateUser(user: DisplayUser): Promise<DisplayUser> {
    const pUser = await this.context.users.getById(user.id);
    Object.assign(pUser, {
      sessionLifetime: user.sessionLifetime,
      accessLevel: user.accessLevel,
      token: undefined,
      tokenExpiration: undefined,
    });

    await this.context.users.update(pUser);
    return pUser.toDisplay();
  }

  async deleteUser(user: DisplayUser): Promise<DisplayUser> {
    const users = await this.context.users.getAll();
    const isAdmin = user.accessLevel === AccessLevel.Administrator;
    const admins = users.filter(u => u.accessLevel === AccessLevel.Administrator);

    if (users.length === 1) throw new Error('delete_user_unavailable');
    if (isAdmin && admins.length === 1) throw new Error('delete_admin_unavailable');

    await this.context.users.delete(user.id);
    return user;
  }

  async changePassword(user: DisplayUser): Promise<DisplayUser> {
    const pUser = await this.context.users.getById(user.id);
    pUser.passwordSalt = await bcrypt.genSalt();
    pUser.passwordHash = await bcrypt.hash(user.password, pUser.passwordSalt);
    pUser.token = undefined;
    pUser.tokenExpiration = undefined;

    await this.context.users.update(pUser);
    return pUser.toDisplay();
  }
}
