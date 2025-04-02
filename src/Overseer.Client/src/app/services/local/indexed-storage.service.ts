import { Inject, Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { map, Observable } from 'rxjs';
import { LogEntry } from '../../models/log-entry.model';
import { Machine } from '../../models/machine.model';
import { PersistedUser } from '../../models/user.model';

export class Store<T> {
  constructor(
    private storeName: string,
    private db: NgxIndexedDBService
  ) {}

  add(value: T, key?: number): Observable<number> {
    return this.db.add<T>(this.storeName, value, key).pipe(map((value) => value.id));
  }

  getByKey(key: number): Observable<T> {
    return this.db.getByKey<T>(this.storeName, key);
  }

  getByID(id: string | number): Observable<T> {
    return this.db.getByID<T>(this.storeName, id);
  }

  getAll(): Observable<T[]> {
    return this.db.getAll<T>(this.storeName);
  }

  update(value: T): Observable<T> {
    return this.db.update<T>(this.storeName, value);
  }

  deleteRecord(key: number): Observable<void> {
    return this.db.deleteByKey(this.storeName, key);
  }

  delete(key: number): Observable<T[]> {
    return this.db.delete<T>(this.storeName, key);
  }

  clear(): Observable<void> {
    return this.db.clear(this.storeName);
  }

  getByIndex(indexName: string, key: IDBValidKey): Observable<T> {
    return this.db.getByIndex<T>(this.storeName, indexName, key);
  }
}

@Injectable({ providedIn: 'root' })
export class IndexedStorageService {
  private stores = new Map<string, any>();

  constructor(@Inject(NgxIndexedDBService) private dbService: NgxIndexedDBService) {}

  get machines(): Store<Machine> {
    return this.getStore<Machine>('machines');
  }

  get users(): Store<PersistedUser> {
    return this.getStore('users');
  }

  get logging(): Store<LogEntry> {
    return this.getStore('logging');
  }

  private getStore<T>(storeName: string) {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Store<T>(storeName, this.dbService));
    }

    return <Store<T>>this.stores.get(storeName);
  }
}
