import { AdapterOptions } from 'lowdb';
import Base from 'lowdb/adapters/Base';
import LocalStorage from 'lowdb/adapters/LocalStorage';

import { DataContextSchema } from '../data-context-schema.interface';

export class AsyncLocalStorage extends Base {
    private localStorage: any;

    constructor(source: string, options: AdapterOptions<DataContextSchema>) {
        super(source, options);

        this.localStorage = new LocalStorage<DataContextSchema>(source, options);
    }

    read() {
        return Promise.resolve(this.localStorage.read());
    }

    write(data: any) {
        return Promise.resolve(this.localStorage.write(data));
    }
}
