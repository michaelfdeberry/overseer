import { NgxIndexedDB } from "ngx-indexed-db";

export const userStoreName = "users";
export const usernameIndex = "username";
export const machineStoreName = "machines";
export const databaseVersion = 1;
export const databaseName = "overseer";

const keyConfiguration = { keyPath: "id", autoIncrement: true };

export async function openDatabase(): Promise<NgxIndexedDB> {
    const db = new NgxIndexedDB(databaseName, databaseVersion);
    await db.openDatabase(1, event => {
        const context = event.currentTarget.result;

        context.createObjectStore(userStoreName, keyConfiguration)
            .createIndex(usernameIndex, usernameIndex, { unique: true });

        context.createObjectStore(machineStoreName, keyConfiguration);
    });

    return db;
}
