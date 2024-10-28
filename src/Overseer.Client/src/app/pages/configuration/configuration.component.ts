import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { SvgComponent } from '../../components/svg/svg.component';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  standalone: true,
  imports: [I18NextModule, RouterOutlet, RouterLink, RouterLinkActive, SvgComponent],
})
export class ConfigurationComponent {}
