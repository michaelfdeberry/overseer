import { DisplayUser } from 'overseer_lib';
import { Observable } from 'rxjs';

export abstract class UsersService {
    abstract getUsers(): Observable<DisplayUser[]>;

    abstract getUser(userId: number): Observable<DisplayUser>;

    abstract createUser(user: DisplayUser): Observable<DisplayUser>;

    abstract updateUser(user: DisplayUser): Observable<DisplayUser>;

    abstract deleteUser(user: DisplayUser): Observable<any>;

    abstract changePassword(user: DisplayUser): Observable<DisplayUser>;
}
