import { AccessLevel } from './access-level.enum';

export interface DisplayUser {
  id?: string;
  username?: string;
  password?: string;
  sessionLifetime?: number;
  token?: string;
  isLoggedIn?: boolean;
  accessLevel?: AccessLevel;
}
