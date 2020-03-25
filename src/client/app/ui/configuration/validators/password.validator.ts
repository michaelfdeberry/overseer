const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');

export function isPasswordValid(password: string): boolean {
  return regex.test(password);
}

export function containsUppercase(password: string): boolean {
  return /^.*[A-Z]/.test(password);
}

export function containsLowercase(password: string): boolean {
  return /^.*[a-z]/.test(password);
}

export function containsNumber(password: string): boolean {
  return /^.*[0-9]/.test(password);
}

export function containsSpecialChar(password: string) {
  return /^.*[!@#$%^&*]/.test(password);
}

export function isValidLength(password: string) {
  return password && password.length >= 8;
}
