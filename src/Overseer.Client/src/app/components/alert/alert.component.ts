import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';

export type AlertOptions = {
  titleKey?: string;
  messageKey?: string;
  actionTextKey?: string;
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  standalone: true,
  imports: [I18NextModule],
})
export class AlertComponent {
  activeModal = inject(NgbActiveModal);
  options = signal<AlertOptions | undefined>(undefined);
}
