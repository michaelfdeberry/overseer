import { Injectable } from '@angular/core';
import { NgxLoggerLevel } from 'ngx-logger';
import { LocalStorageService } from 'ngx-store';
import { defer, forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { UAParser } from 'ua-parser-js';
import { environment } from '../../../environments/environment.local';
import { Machine } from '../../models/machine.model';
import { ApplicationSettings } from '../../models/settings.model';
import { toUser, User } from '../../models/user.model';
import { RequireAdministrator } from '../../shared/require-admin.decorator';
import { SettingsService } from '../settings.service';
import { IndexedStorageService } from './indexed-storage.service';
import { ApplicationInfo } from '../../models/application-info.model';
import { CertificateDetails } from '../../models/certificate-details.model';

@Injectable({ providedIn: 'root' })
export class LocalSettingsService implements SettingsService {
  constructor(
    private localStorage: LocalStorageService,
    private indexedStorage: IndexedStorageService
  ) {}

  createAppSettings(): ApplicationSettings {
    const settings: ApplicationSettings = {
      hideDisabledMachines: false,
      hideIdleMachines: false,
      sortByTimeRemaining: false,
      interval: 10000,
    };

    this.localStorage.set('settings', settings);
    return settings;
  }

  getConfigurationBundle(): Observable<{ users: User[]; machines: Machine[]; settings: ApplicationSettings }> {
    return forkJoin([this.indexedStorage.users.getAll(), this.indexedStorage.machines.getAll()]).pipe(
      map(([users, machines]) => ({
        machines: machines,
        users: users.map((u) => toUser(u)),
        settings: this.localStorage.get('settings') ?? this.createAppSettings(),
      }))
    );
  }

  getSettings(): Observable<ApplicationSettings> {
    return of(this.localStorage.get('settings') ?? this.createAppSettings());
  }

  @RequireAdministrator()
  updateSettings(settings: ApplicationSettings): Observable<ApplicationSettings> {
    this.localStorage.set('settings', settings);
    return of(settings);
  }

  @RequireAdministrator()
  addCertificateException(_certificateDetails: CertificateDetails): Observable<CertificateDetails> {
    // This isn't supported for the client side app as it isn't needed.
    // as long as the browser can open the page the app will be able to access
    // the api.
    return of({});
  }

  getApplicationInfo(): Observable<ApplicationInfo> {
    const parser = new UAParser();

    return of({
      platform: parser.getEngine().name ?? undefined,
      operatingSystem: parser.getOS().name ?? undefined,
      machineName: parser.getBrowser().name ?? undefined,
      version: environment.appVersion ?? undefined,
      runtime: 'N/A',
    });
  }

  getLog(): Observable<string> {
    return this.indexedStorage.logging.getAll().pipe(
      mergeMap((logEntries) => {
        return logEntries
          .map((e) => {
            let message: any = e.message;
            message = typeof message === 'string' ? message : message.stack;
            return `${e.timestamp} - ${NgxLoggerLevel[e.level]} in ${e.fileName}(${e.lineNumber}): ${message}`;
          })
          .join('\n');
      })
    );
  }
}
