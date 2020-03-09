import { DataContext } from '../../data/data-context.class';
import { AccessLevel, DisplayUser, User } from '../../models/users';

export class AuthorizationService {
  constructor(private context: DataContext) {}

  async requiresIntialSetup(): Promise<boolean> {
    const users = (await this.context.users.getAll()) || [];
    return users.filter((u) => u.accessLevel === AccessLevel.Administrator).length === 0;
  }

  async authorize(token: string): Promise<DisplayUser | null> {
    if (!token) return null;

    const user: User = await this.context.users.getByKey((u) => user.token === token.replace('Bearer ', ''));
    if (!token) return null;
    if (user.isTokenExpired()) return null;

    return user.toDisplay();
  }
}
