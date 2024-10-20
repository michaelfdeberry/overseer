import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class ToastsService {
  toasts = signal<Toast[]>([]);

  show({ delay, header, message, type }: Partial<Toast>): void {
    if (!message) return;
    this.toasts.update((toasts) => [...toasts, { id: uuid(), delay, header, message, type }]);
  }

  remove(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
