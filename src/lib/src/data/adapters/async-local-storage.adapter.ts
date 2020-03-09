import { DataContext } from '../data-context.class';

const low = require('lowdb');
const Base = require('lowdb/adapters/Base');
const LocalStorage = require('lowdb/adapters/LocalStorage');

export class AsyncLocalStorage extends Base {
  private localStorage: any;

  constructor(source: string, options?: any) {
    super(source, options);

    this.localStorage = new LocalStorage(source, options);
  }

  read() {
    return Promise.resolve(this.localStorage.read());
  }

  write(data: any) {
    return Promise.resolve(this.localStorage.write(data));
  }
}

export async function getLocalStorageDataContext(): Promise<DataContext> {
  const db = await low(new AsyncLocalStorage('overseer.db'));
  return new DataContext(db);
}
