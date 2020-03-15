import { isPasswordValid } from './password.validator';

export function isConfirmPasswordValid(password: string, confirm: string): boolean {
  return isPasswordValid(confirm) && password === confirm;
}
