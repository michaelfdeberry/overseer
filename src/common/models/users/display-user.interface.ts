import { AccessLevel } from './access-level.enum';

export interface DisplayUser {
  id: number;
  username: string;
  password?: string;
  sessionLifetime?: number;
  token: string;
  isLoggedIn: boolean;
  accessLevel: AccessLevel;
}
