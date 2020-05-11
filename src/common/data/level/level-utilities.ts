import { LevelUp } from 'levelup';

export async function getLevelValue<T>(db: LevelUp, key: string, defaultValue?: T): Promise<T> {
  try {
    return JSON.parse(await db.get(key));
  } catch (error) {
    if (error.notFound) return defaultValue;
    throw error;
  }
}

export async function setLevelValue<T>(db: LevelUp, key: string, value: T): Promise<void> {
  await db.put(key, JSON.stringify(value));
}
