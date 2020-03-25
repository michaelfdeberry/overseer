export function sortByKey<T>(key: keyof T) {
  return (a: T, b: T) => {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
    return 0;
  };
}
