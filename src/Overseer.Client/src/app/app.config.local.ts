import { provideHttpClient } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { dbConfig } from './app.db.config';
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
import { SettingsService } from './services/settings.service';
import { UsersService } from './services/users.service';

export const providers: (Provider | EnvironmentProviders)[] = [
  IndexedStorageService,
  MachineProviderService,
  { provide: AuthenticationService, useClass: LocalAuthenticationService },
  { provide: ControlService, useClass: LocalControlService },
  { provide: LoggingService, useClass: LocalLoggingService },
  { provide: MachinesService, useClass: LocalMachinesService },
  { provide: MonitoringService, useClass: LocalMonitoringService },
  { provide: SettingsService, useClass: LocalSettingsService },
  { provide: UsersService, useClass: LocalUsersService },
  provideHttpClient(),
];

export const modules = [NgxIndexedDBModule.forRoot(dbConfig)];
