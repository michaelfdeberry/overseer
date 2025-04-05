import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { I18NextPipe } from 'angular-i18next';
import { ToastsService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  imports: [CommonModule, NgbToastModule, I18NextPipe],
  templateUrl: './toasts.component.html',
  host: { class: 'toast-container position-fixed bottom-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsComponent {
  toastService = inject(ToastsService);
}
