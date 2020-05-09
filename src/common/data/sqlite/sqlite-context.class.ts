import { Database } from 'sqlite3';

import { Certificate, LogEntry, Machine, User } from '../../models';
import { DataContext } from '../data-context.interface';
import { Repository } from '../repository.interface';
import { ValueStore } from '../value-store.interface';
import { SqliteRepository } from './sqlite-repository.class';
import { SqliteValueStore } from './sqlite-value-store.class';

export class SqliteContext implements DataContext {
  get values(): ValueStore {
    return new SqliteValueStore(this.createDb);
  }

  get machines(): Repository<Machine> {
    return this.createRepository('machines', Machine, ['id', 'type', 'disabled', 'tools', 'sortIndex', 'configuration'], ['tools', 'configuration']);
  }

  get users(): Repository<User> {
    return this.createRepository('users', User, [
      'id',
      'username',
      'passwordHash',
      'passwordSalt',
      'accessLevel',
      'sessionLifetime',
      'token',
      'tokenExpiration',
      'preauthenticatedToken',
      'preauthenticatedTokeExpiration',
    ]);
  }

  get logs(): Repository<LogEntry> {
    return this.createRepository<LogEntry>('logs', LogEntry, ['id', 'message']);
  }

  get certificates(): Repository<Certificate> {
    return this.createRepository<Certificate>('certificates', Certificate, ['id', 'issuedBy', 'issuedTo', 'issueDate', 'expireDate', 'thumbprint']);
  }

  private async createDb(): Promise<Database> {
    return new Promise((resolve, reject) => {
      const db = new Database('overseer.db', err => {
        if (err) {
          reject(err.message);
        } else {
          db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS main.values (id TEXT PRIMARY KEY, value TEXT);');
            db.run(
              'CREATE TABLE IF NOT EXISTS main.machines (id TEXT PRIMARY KEY, type TEXT, disabled INTEGER, tools TEXT, sortIndex INTEGER, configuration TEXT);'
            );
            db.run(
              'CREATE TABLE IF NOT EXISTS main.users (id TEXT PRIMARY KEY, username TEXT, passwordHash TEXT, passwordSalt TEXT, accessLevel INTEGER, sessionLifetime: INTEGER, token: TEXT, tokenExpiration INTEGER, preauthenticatedToken TEXT, preauthenticatedTokenExpiration INTEGER);'
            );
            db.run(
              'CREATE TABLE IF NOT EXISTS main.certificates (id TEXT PRIMARY KEY, issuedTo: TEXT, issuedBy TEXT, issueDate: TEXT, expireDate TEXT, thumbprint TEXT'
            );

            //TODO: create log table
          });
        }
      });
    });
  }

  private createRepository<T>(
    table: string,
    objConstructor: new () => T,
    propertyKeys: Array<keyof T>,
    objectPropertyKeys?: Array<keyof T>
  ): SqliteRepository<T> {
    return new SqliteRepository(this.createDb, table, objConstructor, propertyKeys, objectPropertyKeys);
  }
}
