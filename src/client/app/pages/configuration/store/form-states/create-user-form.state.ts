import { AccessLevel } from 'overseer_lib';

export interface CreateUserFormState {
  isValid?: boolean;
  username?: string;
  password?: string;
  confirmPassword?: string;
  sessionLifetime?: number;
  accessLevel?: AccessLevel;
}
