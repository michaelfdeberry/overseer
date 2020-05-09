import { IDBPDatabase, StoreNames } from 'idb';
import { v4 as uuid } from 'uuid';

import { Repository } from '../repository.interface';
import { OverseerSchema, StoreValueType } from './indexeddb-schema';

export class IndexedDBRepository implements Repository<StoreValueType> {
  constructor(
    private getDb: () => Promise<IDBPDatabase<OverseerSchema>>,
    private store: StoreNames<OverseerSchema>,
    private objConstructor: new () => StoreValueType
  ) {}

  construct(obj: Partial<StoreValueType>): StoreValueType {
    if (!obj) return;

    const result = new this.objConstructor();
    Object.assign(result, obj);
    return result;
  }

  async count(): Promise<number> {
    const db = await this.getDb();
    return await db.count(this.store);
  }

  async add(value: StoreValueType): Promise<string> {
    value.id = uuid();

    const db = await this.getDb();
    const key = await db.put(this.store, value);
    return key.toString();
  }

  async getById(id: string): Promise<StoreValueType> {
    const db = await this.getDb();
    const entity: Partial<StoreValueType> = await db.get(this.store, id);
    return this.construct(entity);
  }

  getByKey(predicate: (v: StoreValueType) => boolean): Promise<StoreValueType> {
    return this.getAll().then(records => records.find(predicate));
  }

  async getAll(): Promise<StoreValueType[]> {
    const db = await this.getDb();
    const entities: Partial<StoreValueType>[] = await db.getAll(this.store);
    return entities.map(e => this.construct(e));
  }

  async update(value: StoreValueType): Promise<StoreValueType> {
    const db = await this.getDb();
    await db.put(this.store, value);
    return value;
  }

  async updateAll(value: StoreValueType[]): Promise<StoreValueType[]> {
    return Promise.all(value.map(v => this.update(v)));
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(this.store, id);
  }
}
