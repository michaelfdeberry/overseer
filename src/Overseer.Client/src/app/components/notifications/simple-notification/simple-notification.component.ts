import { Component, computed } from '@angular/core';
import { SimpleNotification } from '../../../models/notifications.model';
import { NotificationBaseComponent } from '../notification-base.component';

@Component({
  selector: 'app-simple-notification',
  template: `{{ simpleNotification().message }}`,
})
export class SimpleNotificationComponent extends NotificationBaseComponent {
  protected simpleNotification = computed(() => this.notification() as SimpleNotification);
}
