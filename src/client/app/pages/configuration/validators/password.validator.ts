const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');

export function isPasswordValid(password: string): boolean {
  return strongRegex.test(password);
}

export function isPasswordStrong(password: string): boolean {
  return strongRegex.test(password);
}

export function isPasswordMedium(password: string): boolean {
  return mediumRegex.test(password);
}
