import { NgxIndexedDB, IndexDetails } from "ngx-indexed-db";
import { environment } from "../../../../environments/environment";
import { AccessLevel } from "../../../models/user.model";

export const userStoreName = "users";
export const usernameIndex = "username";
export const machineStoreName = "machines";
export const logStoreName = "logging";
export const databaseName = "overseer";

const keyConfiguration = { keyPath: "id", autoIncrement: true };

const databaseUpdates = {
    4: function(transaction) {
        const store = transaction.objectStore(userStoreName);
        const request = store.openCursor();

        // convert existing users to admins now that readonly users are supported.
        request.onsuccess = function(event: Event) {
            const cursor = (<IDBOpenDBRequest>event.target).result;

            if (cursor) {
                const user = cursor["value"];
                if (user.accessLevel === undefined || user.accessLevel === null) {
                    user.accessLevel = AccessLevel.Administrator;
                }

                cursor["update"](user);
                cursor["continue"]();
            }
        };
    }
};

function handleVersionChange(version, transaction) {
    const updateFn = databaseUpdates[version];
    if (!updateFn) { return; }

    updateFn(transaction);
}

export async function openDatabase(): Promise<NgxIndexedDB> {
    const db = new NgxIndexedDB(databaseName, environment.dbVersion);
    await db.openDatabase(environment.dbVersion, (event) => {
        const context = event.currentTarget.result;

        if (!context.objectStoreNames.contains(userStoreName)) {
            context.createObjectStore(userStoreName, keyConfiguration)
            .createIndex(usernameIndex, usernameIndex, { unique: true });
        }

        if (!context.objectStoreNames.contains(machineStoreName)) {
            context.createObjectStore(machineStoreName, keyConfiguration);
        }

        if (!context.objectStoreNames.contains(logStoreName)) {
            context.createObjectStore(logStoreName, keyConfiguration);
        }

        handleVersionChange(context.version, event.target.transaction);
    });

    return db;
}
