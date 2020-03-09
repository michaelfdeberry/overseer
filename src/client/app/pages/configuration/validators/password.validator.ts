const specialCharacters = '"!#$%&\'()*+,-./:;<=>?@[]^_`{|}~';
const requiredCharacters = '0123456789';

export function isPasswordValid(password: string, excludeUndefined: boolean = true): boolean {
  return (
    (password === undefined && excludeUndefined) ||
    (password &&
      password.length >= 8 &&
      Array.from(specialCharacters).some(c => password.includes(c)) &&
      Array.from(requiredCharacters).some(c => password.includes(c)))
  );
}
