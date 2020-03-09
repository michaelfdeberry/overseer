import { isPasswordValid } from './password.validator';

export function isConfirmPasswordValid(password: string, confirm: string, excludedUndefined: boolean = true): boolean {
  return (confirm === undefined && excludedUndefined) || (isPasswordValid(password, excludedUndefined) && password === confirm);
}
