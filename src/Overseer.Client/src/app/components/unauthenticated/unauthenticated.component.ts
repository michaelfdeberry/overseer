import { Component, Input } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'app-unauthenticated',
  templateUrl: './unauthenticated.component.html',
  styleUrls: ['./unauthenticated.component.scss'],
  imports: [SvgComponent, I18NextPipe],
})
export class UnauthenticatedComponent {
  @Input() message: string = '';
}
