import { DataContext } from '../data-context.class';

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

export async function getFileDataContext(): Promise<DataContext> {
  const db = await low(new FileAsync('overseer.db'));
  return new DataContext(db);
}
