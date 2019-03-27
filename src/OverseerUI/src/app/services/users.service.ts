import { Observable } from "rxjs";
import { User } from "../models/user.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export abstract class UsersService {
    abstract getUsers(): Observable<User[]>;

    abstract getUser(userId: number): Observable<User>;

    abstract createUser(user: User): Observable<User>;

    abstract updateUser(user: User): Observable<User>;

    abstract deleteUser(user: User): Observable<any>;

    abstract changePassword(user: User): Observable<User>;
}
