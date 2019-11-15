import { Injectable } from "@angular/core";
import { NGXLogInterface } from "ngx-logger";
import { openDatabase, logStoreName } from "./open-database-function";
import { NgxIndexedDB } from "ngx-indexed-db";

export type LogEntry = NGXLogInterface & {
    id?: number
};

@Injectable({ providedIn: "root" })
export class LogStorageService {
    private async getAllEntries(db: NgxIndexedDB): Promise<LogEntry[]> {
        return await db.getAll(logStoreName);
    }

    private async prune(): Promise<void> {
        const db = await openDatabase();
        const entries = await this.getAllEntries(db);
        // only maintain 2 days of logs max
        const minAge = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));

        entries.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            if (minAge >= entryDate) {
                db.delete(logStoreName, entry.id);
            }
        });
    }

    async write(entry: LogEntry): Promise<void> {
        const db = await openDatabase();
        await this.prune();
        await db.add(logStoreName, entry);
    }

    async read(): Promise<LogEntry[]> {
        return await this.getAllEntries(await openDatabase());
    }
}
