import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingsService } from '../../services/settings.service';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['../configuration.scss', './about.component.scss'],
})
export class AboutComponent implements OnInit {
  applicationInfo$!: Observable<any>;
  currentYear = new Date().getFullYear();

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.applicationInfo$ = this.settingsService.getApplicationInfo();
  }

  getKeys(obj: Record<string, unknown>) {
    return Object.keys(obj);
  }

  downloadLog() {
    this.settingsService.getLog().subscribe((log) => {
      const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.download = 'overseer.log';
      link.href = URL.createObjectURL(blob);
      link.click();

      URL.revokeObjectURL(link.href);
    });
  }
}
