import { Injectable } from '@angular/core';
import { endpointFactory } from './endpoint-factory';
import { HttpClient } from '@angular/common/http';
import { UsersService } from '../users.service';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class RemoteUsersService implements UsersService {
  private getEndpoint = endpointFactory('/api/users');

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.getEndpoint());
  }

  getUser(userId: number) {
    return this.http.get<User>(this.getEndpoint(userId));
  }

  createUser(user: User) {
    return this.http.post<User>(this.getEndpoint(), user);
  }

  updateUser(user: User) {
    return this.http.put<User>(this.getEndpoint(), user);
  }

  deleteUser(user: User) {
    return this.http.delete(this.getEndpoint(user.id));
  }

  changePassword(user: User) {
    return this.http.post<User>(this.getEndpoint('password'), user);
  }
}
