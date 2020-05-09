export interface ValueStore {
  get<T>(name: string): Promise<T>;
  getOrSet<T>(name: string, setAction: () => T): Promise<T>;
  set<T>(name: string, value: T): Promise<void>;
}
