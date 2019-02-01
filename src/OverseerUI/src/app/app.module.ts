import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { NgProgressModule } from "@ngx-progressbar/core";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { WebStorageModule } from "ngx-store";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AlertDialogComponent } from "./dialogs/alert-dialog.component";
import { PromptDialogComponent } from "./dialogs/prompt-dialog.component";
import { LoginComponent } from "./login/login.component";
import { AppMaterialModule } from "./material-imports.module";
import { MachineMonitorFilterPipe } from "./monitoring/machine-monitor-filter.pipe";
import { MachineMonitorComponent } from "./monitoring/machine-monitor.component";
import { MonitoringComponent } from "./monitoring/monitoring.component";
import { TuneDialogComponent } from "./monitoring/tune-dialog.component";
import { NavigationComponent } from "./navigation/navigation.component";
import { DurationPipe } from "./shared/duration.pipe";
import { LetDirective } from "./shared/let.directive";
import { providers } from "./app-providers-remote";
import { FlexLayoutModule } from "@angular/flex-layout";

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

// This is only used by the .Net Framework version of signalr
// to access jquery. However in the production build the window
// reference doesn't get loaded if this is in the mono provider file.
// This will end up in the build for the other build types, but that
// shouldn't really be an issue since it's not used.
export class OverseerWindow extends Window {
    $: any;
}

@NgModule({
    entryComponents: [
        AlertDialogComponent,
        PromptDialogComponent,
        TuneDialogComponent
    ],
    declarations: [
        AppComponent,
        NavigationComponent,
        MonitoringComponent,
        MachineMonitorComponent,
        LoginComponent,
        DurationPipe,
        MachineMonitorFilterPipe,
        AlertDialogComponent,
        PromptDialogComponent,
        TuneDialogComponent,
        LetDirective,
    ],
    imports: [
        AppRoutingModule,
        NgProgressModule.forRoot({
            spinner: false,
            thick: true
        }),
        RouterModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppMaterialModule,
        WebStorageModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        ...providers,
        { provide: OverseerWindow, useValue: window }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
