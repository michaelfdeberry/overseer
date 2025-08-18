import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  imports: [RouterLink],
})
export class NotificationCardComponent {
  route = input<string>();
  queryParams = input<Record<string, string> | null>(null);
}
