export function isPasswordValid(password: string): boolean {
  const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
  return password && regex.test(password);
}

export function containsUppercase(password: string): boolean {
  return password && /^.*[A-Z]/.test(password);
}

export function containsLowercase(password: string): boolean {
  return password && /^.*[a-z]/.test(password);
}

export function containsNumber(password: string): boolean {
  return password && /^.*[0-9]/.test(password);
}

export function containsSpecialChar(password: string) {
  return password && /^.*[!@#$%^&*]/.test(password);
}

export function isValidLength(password: string) {
  return password && password.length >= 8;
}
