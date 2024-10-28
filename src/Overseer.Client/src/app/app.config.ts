import { ApplicationConfig, ErrorHandler, importProvidersFrom, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { I18NextModule } from 'angular-i18next';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { environment } from '../environments/environment';
import { dbConfig } from './app.db.config';
import { routes } from './app.routes';
import { I18N_PROVIDERS } from './app.translations';
// import { DialogService } from './dialogs/dialog.service';
import { progressInterceptor } from 'ngx-progressbar/http';
import { AppHttpInterceptor } from './app-http-interceptor';
import { AuthenticationService } from './services/authentication.service';
import { ControlService } from './services/control.service';
import { LocalStorageService } from './services/local-storage.service';
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
import { OverseerErrorHandler } from './services/error-handler.service';

const services: Provider[] =
  environment.serviceType === 'remote'
    ? [
        { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
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
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([progressInterceptor])),
    importProvidersFrom(...modules, I18NextModule.forRoot(), ThemeService),
    I18N_PROVIDERS,
    LocalStorageService,
    {
      provide: ErrorHandler,
      useClass: OverseerErrorHandler,
    },
    ...services,
  ],
};
