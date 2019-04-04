import { Injectable } from "@angular/core";
import { PersistedUser, AccessLevel } from "../../../models/user.model";
import { openDatabase, usernameIndex, userStoreName } from "./open-database-function";

@Injectable({ providedIn: "root" })
export class UserStorageService {

    async createUser(user: PersistedUser): Promise<PersistedUser> {
        const db = await openDatabase();
        await db.add(userStoreName, user);

        return user;
    }

    async getUsers(): Promise<PersistedUser[]> {
        const db = await openDatabase();
        return await db.getAll(userStoreName);
    }

    async getUserById(userId: number): Promise<PersistedUser> {
        const db = await openDatabase();
        return await  db.getByKey(userStoreName, userId);
    }

    async getUserByUsername(username: string): Promise<PersistedUser> {
        const db = await openDatabase();
        return await db.getByIndex(userStoreName, usernameIndex, username);
    }

    async updateUser(user: PersistedUser): Promise<PersistedUser> {
        const db = await openDatabase();
        await db.update(userStoreName, user);
        return user;
    }

    async deleteUser(userId: number): Promise<any> {
        const db = await openDatabase();
        return await db.delete(userStoreName, userId);
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
