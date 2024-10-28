import { inject, Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';
import { v4 as uuid } from 'uuid';
import { I18NextService } from 'angular-i18next';

@Injectable({ providedIn: 'root' })
export class ToastsService {
  private i18NextService = inject(I18NextService);
  toasts = signal<Toast[]>([]);

  show({ delay, header, message, type }: Partial<Toast>): string | undefined {
    if (!message) return undefined;

    const messageText = this.i18NextService.t(message);
    if (header) {
      header = this.i18NextService.t(header) ?? header;
    }

    const id = uuid();
    this.toasts.update((toasts) => [...toasts, { id, delay, header, message: messageText ?? message, type }]);
    return id;
  }

  remove(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
