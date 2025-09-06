import { Component, computed, inject, TemplateRef } from '@angular/core';
import { NgbActiveOffcanvas, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { I18NextPipe } from 'angular-i18next';
import { NotificationService } from '../../services/notification.service';
import { NotificationHostComponent } from './notification-host.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  imports: [I18NextPipe, NotificationHostComponent],
})
export class NotificationsComponent {
  private offcanvasService = inject(NgbOffcanvas);
  notificationService = inject(NotificationService);

  get notifications() {
    return this.notificationService.notifications;
  }

  unreadCount = computed(() => {
    if (this.notificationService.notifications.error()) return undefined;
    if (!this.notificationService.notifications.hasValue()) return undefined;

    const notifications = this.notificationService.notifications.value();
    if (!notifications) return undefined;

    return notifications.filter((n) => !n.isRead).length;
  });

  async open(content: TemplateRef<unknown>): Promise<void> {
    try {
      await this.offcanvasService.open(content, { position: 'end' }).result;
    } finally {
      // the off canvas rejects the promise when clicked outside, so using finally to mark all notifications as read
      const notifications = this.notificationService.notifications
        .value()
        ?.filter((n) => !n.isRead)
        .map((n) => n.id);

      if (notifications?.length) {
        this.notificationService.markAllAsRead(notifications).subscribe();
      }
    }
  }

  clearNotifications(offcanvas: NgbActiveOffcanvas): void {
    this.notificationService.clearNotifications().subscribe();
    offcanvas.close();
  }

  handleClose(offcanvas: NgbActiveOffcanvas): void {
    offcanvas.close();
  }
}
