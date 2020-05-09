import { Database } from 'sqlite3';
import { v4 as uuid } from 'uuid';

import { Repository } from '../repository.interface';

export class SqliteRepository<T extends { id?: string; [key: string]: any }> implements Repository<T> {
  private objectPropertyKeys: Array<keyof T>;

  constructor(
    private getDb: () => Promise<Database>,
    private table: string,
    private objConstructor: new () => T,
    private propertyKeys: Array<keyof T>,
    objectPropertyKeys?: Array<keyof T>
  ) {
    this.objectPropertyKeys = objectPropertyKeys ?? [];
  }

  private construct(row: any): T {
    if (!row) return;

    const result = new this.objConstructor();
    Object.assign(
      result,
      this.propertyKeys.reduce((obj, key) => {
        obj[key] = this.objectPropertyKeys.indexOf(key) ? JSON.parse(row[key]) : row[key];
        return result;
      }, <any>{})
    );

    return result;
  }

  add(value: T): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const id = uuid();
      const sql = `INSERT INTO ${this.table} (id,${this.propertyKeys.join()}) VALUE (?,${this.propertyKeys.map(() => '?').join()})`;
      const params = this.propertyKeys.map(key => (this.objectPropertyKeys.indexOf(key) >= 0 ? JSON.stringify(value[key]) : value[key])).join();

      db.run(sql, params, err => {
        if (err) {
          reject(err.message);
        } else {
          resolve(id);
        }
        db.close();
      });
    });
  }

  getById(id: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const sql = `SELECT ${this.propertyKeys.join()} FROM ${this.table} WHERE id=?`;

      db.get(sql, id, (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(this.construct(row));
        }
        db.close();
      });
    });
  }

  getByKey(predicate: (v: T) => boolean): Promise<T> {
    return this.getAll().then(records => records.find(predicate));
  }

  getAll(): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const sql = `SELECT ${this.propertyKeys.join()} FROM ${this.table}`;
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows.map(row => this.construct(row)));
        }
        db.close();
      });
    });
  }

  update(value: T): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const args = this.propertyKeys.map(key => `${key}=?`).join();
      const sql = `UPDATE ${this.table} SET ${args} WHERE id=?`;
      const params = [
        ...this.propertyKeys
          .filter(key => key !== 'id')
          .map(key => `${key}=${this.objectPropertyKeys.indexOf(key) >= 0 ? JSON.stringify(value[key]) : value[key]}`),
        value.id,
      ];

      db.run(sql, params, err => {
        if (err) {
          reject(err.message);
        } else {
          resolve(value);
        }
        db.close();
      });
    });
  }

  updateAll(value: T[]): Promise<T[]> {
    return Promise.all(value.map(v => this.update(v)));
  }

  delete(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const sql = `DELETE FROM ${this.table} WHERE id=?`;

      db.run(sql, id, err => {
        if (err) {
          reject(err.message);
        } else {
          resolve();
        }
        db.close();
      });
    });
  }

  count(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDb();
      const sql = `SELECT COUNT(*) as total from ${this.table}`;
      db.get(sql, (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row.total);
        }
        db.close();
      });
    });
  }
}
