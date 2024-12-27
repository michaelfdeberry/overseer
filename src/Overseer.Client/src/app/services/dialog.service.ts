import { inject, Injectable, Type } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent, AlertOptions } from '../components/alert/alert.component';
import { PromptComponent, PromptOptions } from '../components/prompt/prompt.component';

@Injectable()
export class DialogService {
  private modalService = inject(NgbModal);

  show<T, O>(content: Type<T>, options?: O): NgbModalRef {
    const modal = this.modalService.open(content);
    if (options) {
      Object.assign(modal.componentInstance, options);
    }
    return modal;
  }

  alert(options: AlertOptions = {}): NgbModalRef {
    const modal = this.modalService.open(AlertComponent);
    const alert = modal.componentInstance as AlertComponent;
    alert.options.set({
      titleKey: 'warning',
      messageKey: 'areYourSure',
      actionTextKey: 'ok',
      ...options,
    });
    return modal;
  }

  prompt(options: PromptOptions = {}): NgbModalRef {
    const modal = this.modalService.open(PromptComponent);
    modal.closed.subscribe;
    const prompt = modal.componentInstance as PromptComponent;
    prompt.options.set({
      titleKey: 'warning',
      messageKey: 'areYourSure',
      negativeActionTextKey: 'no',
      positiveActionTextKey: 'yes',
      ...options,
    });
    return modal;
  }
}
