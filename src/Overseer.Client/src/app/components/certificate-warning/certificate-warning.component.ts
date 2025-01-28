import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18NextModule } from 'angular-i18next';
import { Certificate } from '../../models/certificate';

@Component({
    selector: 'app-certificate-warning',
    templateUrl: './certificate-warning.component.html',
    imports: [I18NextModule]
})
export class CertificateWarningComponent {
  data?: Certificate;
  activeModal = inject(NgbActiveModal);
}
