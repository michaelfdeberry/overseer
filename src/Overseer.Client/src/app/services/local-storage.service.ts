import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get<T>(name: string): T | undefined {
    try {
      let value = window.localStorage.getItem(name);
      if (!value) {
        // it may be a legacy key, try to migrate it
        const prefix = window.localStorage.getItem('NGX-STORE_prefix');
        const key = `${prefix}_${name}`;
        value = window.localStorage.getItem(key);
        if (!value) return undefined;

        this.set(name, JSON.parse(value));
        window.localStorage.removeItem(key);
      }
      return JSON.parse(value);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  set<T>(name: string, item: T): void {
    if (!item) return;
    window.localStorage.setItem(name, JSON.stringify(item));
  }

  remove(name: string): void {
    window.localStorage.removeItem(name);
  }

  clear(): void {
    window.localStorage.clear();
  }
}
