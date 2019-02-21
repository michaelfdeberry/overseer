import { NgxIndexedDB } from "ngx-indexed-db";
import { environment } from "../../../../environments/environment";

export const userStoreName = "users";
export const usernameIndex = "username";
export const machineStoreName = "machines";
export const databaseName = "overseer";

const keyConfiguration = { keyPath: "id", autoIncrement: true };

export async function openDatabase(): Promise<NgxIndexedDB> {
    const db = new NgxIndexedDB(databaseName, environment.dbVersion);
    await db.openDatabase(environment.dbVersion, event => {
        const context = event.currentTarget.result;

        context.createObjectStore(userStoreName, keyConfiguration)
            .createIndex(usernameIndex, usernameIndex, { unique: true });

        context.createObjectStore(machineStoreName, keyConfiguration);
    });

    return db;
}
