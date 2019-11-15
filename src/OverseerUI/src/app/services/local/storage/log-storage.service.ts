import { Injectable } from "@angular/core";
import { NGXLogInterface } from "ngx-logger";
import { NgxIndexedDBService } from "ngx-indexed-db";

export type LogEntry = NGXLogInterface & {
    id?: number
};

@Injectable({ providedIn: "root" })
export class LogStorageService {
    constructor(private db: NgxIndexedDBService) {}

    private async getAllEntries(): Promise<LogEntry[]> {
        return await this.db.getAll();
    }

    private async prune(): Promise<void> {
        this.db.currentStore = "logging";
        const entries = await this.getAllEntries();

        // only maintain 2 days of logs max
        const minAge = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
        const promises = entries
            .map(entry => {
                const entryDate = new Date(entry.timestamp);
                if (minAge >= entryDate) {
                    return this.db.deleteRecord(entry.id);
                }
            })
            .filter(x => x);

        await Promise.all(promises);
    }

    async write(entry: LogEntry): Promise<void> {
        this.db.currentStore = "logging";
        await this.prune();
        await this.db.add(entry);
    }

    async read(): Promise<LogEntry[]> {
        this.db.currentStore = "logging";
        return await this.getAllEntries();
    }
}
