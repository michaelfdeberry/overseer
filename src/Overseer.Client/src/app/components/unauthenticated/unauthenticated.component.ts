import { Component, Input, input } from '@angular/core';
import { SvgComponent } from '../svg/svg.component';
import { I18NextModule } from 'angular-i18next';

@Component({
    selector: 'app-unauthenticated',
    templateUrl: './unauthenticated.component.html',
    styleUrls: ['./unauthenticated.component.scss'],
    imports: [SvgComponent, I18NextModule]
})
export class UnauthenticatedComponent {
  @Input() message: string = '';
}
