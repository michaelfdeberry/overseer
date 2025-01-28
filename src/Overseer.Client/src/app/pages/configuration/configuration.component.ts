import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  imports: [I18NextModule, RouterOutlet, RouterLink, RouterLinkActive],
})
export class ConfigurationComponent {}
