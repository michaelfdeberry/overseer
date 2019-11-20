import { Injectable, Inject } from "@angular/core";
import { NgxIndexedDBService, DBConfig, CONFIG_TOKEN } from "ngx-indexed-db";
import { Machine } from "../../models/machine.model";
import { PersistedUser } from "../../models/user.model";
import { NGXLogInterface } from "ngx-logger";

export class Store<T> {
    constructor(private storeName: string, private db: NgxIndexedDBService) {
        db.currentStore = storeName;
    }

    add(value: T, key?: any): Promise<number> {
        return this.db.add(value, key);
    }

    getByKey(key: any): Promise<T> {
        return this.db.getByKey(key);
    }

    getByID(id: string | number): Promise<T> {
        return this.db.getByID(id);
    }

    getAll(): Promise<T[]> {
        return this.db.getAll();
    }

    update(value: T, key?: any): Promise<any> {
        return this.db.update(value, key);
    }

    deleteRecord(key: any): Promise<any> {
        return this.db.deleteRecord(key);
    }

    clear(): Promise<any> {
        return this.db.clear();
    }

    openCursor(cursorCallback: (event: Event) => void, keyRange?: IDBKeyRange): Promise<void> {
        return this.db.openCursor(cursorCallback, keyRange);
    }

    getByIndex(indexName: string, key: any): Promise<any> {
        return this.db.getByIndex(indexName, key);
    }
}

@Injectable({ providedIn: "root"})
export class IndexedStorageService {
    private stores = new Map<string, any>();

    constructor (@Inject(CONFIG_TOKEN) private dbConfig: DBConfig) {}

    get machines(): Store<Machine> {
        return this.getStore("machines");
    }

    get users(): Store<PersistedUser> {
        return this.getStore("users");
    }

    get logging(): Store<NGXLogInterface> {
        return this.getStore("logging");
    }

    private getStore<T>(storeName: string) {
        if (!this.stores.has(storeName)) {
            this.stores.set(storeName, new Store<T>(storeName, new NgxIndexedDBService(this.dbConfig)));
        }

        return <Store<T>>this.stores.get(storeName);
    }
}
