import { ApplicationConfig, importProvidersFrom, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { I18NextModule } from 'angular-i18next';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LocalStorageService, WebStorageModule } from 'ngx-store';
import { environment } from '../environments/environment';
import { dbConfig } from './app.db.config';
import { routes } from './app.routes';
import { I18N_PROVIDERS } from './app.translations';
import { DialogService } from './dialogs/dialog.service';
import { AuthenticationService } from './services/authentication.service';
import { ControlService } from './services/control.service';
import { LocalAuthenticationService } from './services/local/authentication.service';
import { LocalControlService } from './services/local/control.service';
import { IndexedStorageService } from './services/local/indexed-storage.service';
import { LocalLoggingService } from './services/local/logging.service';
import { LocalMachinesService } from './services/local/machines.service';
import { LocalMonitoringService } from './services/local/monitoring.service';
import { MachineProviderService } from './services/local/providers/machine-provider.service';
import { LocalSettingsService } from './services/local/settings.service';
import { LocalUsersService } from './services/local/users.service';
import { LoggingService } from './services/logging.service';
import { MachinesService } from './services/machines.service';
import { MonitoringService } from './services/monitoring.service';
import { RemoteAuthenticationService } from './services/remote/authentication.service';
import { RemoteControlService } from './services/remote/control.service';
import { RemoteLoggingService } from './services/remote/logging.service';
import { RemoteMachinesService } from './services/remote/machines.service';
import { RemoteMonitoringService } from './services/remote/monitoring.service';
import { RemoteSettingsService } from './services/remote/settings.service';
import { RemoteUsersService } from './services/remote/users.service';
import { SettingsService } from './services/settings.service';
import { ThemeService } from './services/theme.service';
import { UsersService } from './services/users.service';
import { AuthenticationGuard } from './shared/authentication-guard';

const services: Provider[] =
  environment.serviceType === 'remote'
    ? [
        { provide: AuthenticationService, useClass: RemoteAuthenticationService },
        { provide: ControlService, useClass: RemoteControlService },
        { provide: LoggingService, useClass: RemoteLoggingService },
        { provide: MachinesService, useClass: RemoteMachinesService },
        { provide: MonitoringService, useClass: RemoteMonitoringService },
        { provide: SettingsService, useClass: RemoteSettingsService },
        { provide: UsersService, useClass: RemoteUsersService },
      ]
    : [
        IndexedStorageService,
        MachineProviderService,
        { provide: AuthenticationService, useClass: LocalAuthenticationService },
        { provide: ControlService, useClass: LocalControlService },
        { provide: LoggingService, useClass: LocalLoggingService },
        { provide: MachinesService, useClass: LocalMachinesService },
        { provide: MonitoringService, useClass: LocalMonitoringService },
        { provide: SettingsService, useClass: LocalSettingsService },
        { provide: UsersService, useClass: LocalUsersService },
      ];

const modules = environment.serviceType === 'remote' ? [] : [NgxIndexedDBModule.forRoot(dbConfig)];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      ...modules,
      I18NextModule.forRoot(),
      ThemeService,
      WebStorageModule.forRoot(),
      AuthenticationGuard,
      LoggerModule.forRoot({
        level: NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.INFO,
      })
    ),
    I18N_PROVIDERS,
    AuthenticationGuard,
    LocalStorageService,
    DialogService,
    ...services,
  ],
};
