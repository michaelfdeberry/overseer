export function toDuration(milliseconds: number): string {
  if (!milliseconds) {
    return '0h 0m';
  }

  const h = Math.floor(milliseconds / 3600);
  const m = Math.floor((milliseconds % 3600) / 60);

  return h + 'h ' + m + 'm';
}
