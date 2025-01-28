import { Component, inject, OnInit, signal } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { SettingsService } from '../../services/settings.service';
import { ApplicationInfo } from '../../models/application-info.model';
import { LoggingService } from '../../services/logging.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    imports: [I18NextModule]
})
export class AboutComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private loggingService = inject(LoggingService);

  applicationInfo = signal<{ label: string; value?: string }[] | undefined>(undefined);
  currentYear = signal(new Date().getFullYear());

  ngOnInit() {
    this.settingsService.getApplicationInfo().subscribe((applicationInfo) => {
      this.applicationInfo.set(Object.keys(applicationInfo).map((key) => ({ label: key, value: applicationInfo[key as keyof ApplicationInfo] })));
    });
  }

  downloadLog() {
    this.loggingService.download().subscribe((log: string) => {
      const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.download = 'overseer.log';
      link.href = URL.createObjectURL(blob);
      link.click();

      URL.revokeObjectURL(link.href);
    });
  }
}
