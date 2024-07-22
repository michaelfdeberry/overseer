import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.scss'],
})
export class ConfigurationComponent {
  constructor(private route: ActivatedRoute) {}
}
