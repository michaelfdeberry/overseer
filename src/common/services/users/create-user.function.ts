import * as bcrypt from 'bcryptjs';

import { Repository } from '../../data/repository.class';
import { DisplayUser, User } from '../../models/users';

export async function createUser(users: Repository<User>, user: DisplayUser): Promise<DisplayUser> {
  if (!user) throw new Error('invalid_user');
  if (!user.username) throw new Error('invalid_username');
  if (!user.password) throw new Error('invalid_password');
  if (await users.getByKey(u => u.username.toLowerCase() === user.username.toLowerCase())) throw new Error('unavailable_username');

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(user.password, salt);
  const pUser = new User({
    username: user.username,
    passwordHash: hash,
    passwordSalt: salt,
    sessionLifetime: user.sessionLifetime,
    accessLevel: user.accessLevel,
  });
  await users.add(pUser);
  return User.toDisplay(pUser);
}
