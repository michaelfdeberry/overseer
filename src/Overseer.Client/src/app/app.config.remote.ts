import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { progressInterceptor } from 'ngx-progressbar/http';
import { overseerInterceptor } from './app.interceptor';
import { AuthenticationService } from './services/authentication.service';
import { ControlService } from './services/control.service';
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
import { UsersService } from './services/users.service';

export const providers: (Provider | EnvironmentProviders)[] = [
  { provide: AuthenticationService, useClass: RemoteAuthenticationService },
  { provide: ControlService, useClass: RemoteControlService },
  { provide: LoggingService, useClass: RemoteLoggingService },
  { provide: MachinesService, useClass: RemoteMachinesService },
  { provide: MonitoringService, useClass: RemoteMonitoringService },
  { provide: SettingsService, useClass: RemoteSettingsService },
  { provide: UsersService, useClass: RemoteUsersService },
  provideHttpClient(withInterceptors([progressInterceptor, overseerInterceptor])),
];

export const modules = [];
