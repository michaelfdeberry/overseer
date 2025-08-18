import { Component, inject, input, output } from '@angular/core';
import { Notification } from '../../models/notifications.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  template: '',
})
export class NotificationBaseComponent {
  protected notificationService = inject(NotificationService);

  notification = input.required<Notification>();
  close = output<void>();
}
