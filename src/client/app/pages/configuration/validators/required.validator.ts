export function isRequiredFieldValid<T>(value: T | undefined): boolean {
  return !!value;
}
