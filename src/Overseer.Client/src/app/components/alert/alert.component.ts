import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18NextPipe } from 'angular-i18next';

export type AlertOptions = {
  titleKey?: string;
  messageKey?: string;
  actionTextKey?: string;
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  imports: [I18NextPipe],
})
export class AlertComponent {
  activeModal = inject(NgbActiveModal);
  options = signal<AlertOptions | undefined>(undefined);
}
