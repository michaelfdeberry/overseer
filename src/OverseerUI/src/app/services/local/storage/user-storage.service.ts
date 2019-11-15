import { Injectable } from "@angular/core";
import { PersistedUser, AccessLevel } from "../../../models/user.model";
import { NgxIndexedDBService } from "ngx-indexed-db";

@Injectable({ providedIn: "root" })
export class UserStorageService {
    constructor(private db: NgxIndexedDBService) {
    }

    executeDbRequest<T>(action: () => T): T {
        this.db.currentStore = "users";
        return action();
    }

    async createUser(user: PersistedUser): Promise<PersistedUser> {
        this.executeDbRequest(() => this.db.add(user));
        return user;
    }

    async getUsers(): Promise<PersistedUser[]> {
        return await this.executeDbRequest(() => this.db.getAll());
    }

    async getUserById(userId: number): Promise<PersistedUser> {
        return await this.executeDbRequest(() => this.db.getByID(userId));
    }

    async getUserByUsername(username: string): Promise<PersistedUser> {
        return await this.executeDbRequest(() => this.db.getByIndex("username", username));
    }

    async updateUser(user: PersistedUser): Promise<PersistedUser> {
        await this.executeDbRequest(() => this.db.update(user, user.id));
        return user;
    }

    async deleteUser(userId: number): Promise<any> {
        return await this.executeDbRequest(() => this.db.deleteRecord(userId));
    }

    async getAdminCount(): Promise<number> {
        const users = await this.getUsers();
        return users.filter(u => u.accessLevel === AccessLevel.Administrator).length;
    }

    async getUserCount(): Promise<number> {
        const users = await this.getUsers();
        return users.length;
    }
}
