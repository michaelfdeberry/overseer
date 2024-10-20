import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule, NgbToastModule, I18NextModule],
  templateUrl: './toast.component.html',
  host: { class: 'toast-container position-fixed bottom-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsComponent {
  toastService = inject(ToastsService);
}
