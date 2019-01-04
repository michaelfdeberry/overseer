import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { OverseerHttpInterceptor } from "./app-http-interceptor";
import { DialogService } from "./dialogs/dialog.service";
import { TuneDialogService } from "./monitoring/tune-dialog.service";
import { AuthenticationService } from "./services/authentication.service";
import { ControlService } from "./services/control.service";
import { LoaderService } from "./services/loader.service";
import { MachinesService } from "./services/machines.service";
import { RemoteAuthenticationService } from "./services/remote/authentication.service";
import { RemoteControlService } from "./services/remote/control.service";
import { RemoteMachinesService } from "./services/remote/machines.service";
import { RemoteSettingsService } from "./services/remote/settings.service";
import { RemoteUsersService } from "./services/remote/users.service";
import { SettingsService } from "./services/settings.service";
import { ThemeService } from "./services/theme.service";
import { UsersService } from "./services/users.service";
import { AuthenticationGuard } from "./shared/authentication-guard";
import { MonitoringService } from "./services/monitoring.service";
import { SignalrCoreMonitoringService } from "./services/remote/signalr-core-monitoring.service";

export const providers = [
    LoaderService,
    AuthenticationGuard,
    DialogService,
    TuneDialogService,
    ThemeService,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: OverseerHttpInterceptor,
        multi: true
    },
    {
        provide: MonitoringService,
        useClass: SignalrCoreMonitoringService
    },
    {
        provide: AuthenticationService,
        useClass: RemoteAuthenticationService
    },
    {
        provide: ControlService,
        useClass: RemoteControlService
    },
    {
        provide: MachinesService,
        useClass: RemoteMachinesService
    },
    {
        provide: SettingsService,
        useClass: RemoteSettingsService
    },
    {
        provide: UsersService,
        useClass: RemoteUsersService
    }
];
