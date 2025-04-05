import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18NextPipe } from 'angular-i18next';

export type PromptOptions = {
  titleKey?: string;
  messageKey?: string;
  negativeActionTextKey?: string;
  positiveActionTextKey?: string;
};

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  imports: [I18NextPipe],
})
export class PromptComponent {
  activeModal = inject(NgbActiveModal);
  options = signal<PromptOptions | undefined>(undefined);
}
