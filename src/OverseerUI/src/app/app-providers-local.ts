import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { OverseerHttpInterceptor } from "./app-http-interceptor";
import { DialogService } from "./dialogs/dialog.service";
import { MonitoringService } from "./services/monitoring.service";
import { LocalMonitoringService } from "./services/local/monitoring.service";
import { TuneDialogService } from "./monitoring/tune-dialog.service";
import { AuthenticationService } from "./services/authentication.service";
import { ControlService } from "./services/control.service";
import { LoaderService } from "./services/loader.service";
import { LocalAuthenticationService } from "./services/local/authentication.service";
import { LocalControlService } from "./services/local/control.service";
import { LocalMachinesService } from "./services/local/machines.service";
import { LocalSettingsService } from "./services/local/settings.service";
import { LocalUsersService } from "./services/local/users.service";
import { MachinesService } from "./services/machines.service";
import { SettingsService } from "./services/settings.service";
import { ThemeService } from "./services/theme.service";
import { UsersService } from "./services/users.service";
import { AuthenticationGuard, AccessLevelGuard } from "./shared/authentication-guard";
import { UserStorageService } from "./services/local/storage/user-storage.service";
import { MachineStorageService } from "./services/local/storage/machine-storage.service";

export const providers = [
    LoaderService,
    AuthenticationGuard,
    AccessLevelGuard,
    DialogService,
    TuneDialogService,
    ThemeService,
    UserStorageService,
    MachineStorageService,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: OverseerHttpInterceptor,
        multi: true
    },
    {
        provide: MonitoringService,
        useClass: LocalMonitoringService
    },
    {
        provide: AuthenticationService,
        useClass: LocalAuthenticationService
    },
    {
        provide: ControlService,
        useClass: LocalControlService
    },
    {
        provide: MachinesService,
        useClass: LocalMachinesService
    },
    {
        provide: SettingsService,
        useClass: LocalSettingsService
    },
    {
        provide: UsersService,
        useClass: LocalUsersService
    }
];
