export interface Repository<T extends { id?: string }> {
  add(value: T): Promise<string>;
  getById(id: string): Promise<T>;
  getByKey(predicate: (t: T) => boolean): Promise<T>;
  getAll(): Promise<T[]>;
  update(value: T): Promise<T>;
  updateAll(value: T[]): Promise<T[]>;
  delete(id: string): Promise<void>;
  deleteAll(ids: string[]): Promise<void>;
  count(): Promise<number>;
}
