import { Component, inject, output, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';

export type PromptOptions = {
  titleKey?: string;
  messageKey?: string;
  negativeActionTextKey?: string;
  positiveActionTextKey?: string;
};

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  standalone: true,
  imports: [I18NextModule],
})
export class PromptComponent {
  activeModal = inject(NgbActiveModal);
  options = signal<PromptOptions | undefined>(undefined);
}
