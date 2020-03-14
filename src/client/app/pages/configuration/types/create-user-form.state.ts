import { AccessLevel } from '@overseer/common/models';

export interface CreateUserFormState {
  isValid?: boolean;
  username?: string;
  password?: string;
  confirmPassword?: string;
  sessionLifetime?: number;
  accessLevel?: AccessLevel;
}
