import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { modules, providers } from './app.config.local';
import { routes } from './app.routes';
import { I18N_PROVIDERS } from './app.translations';
import { OverseerErrorHandler } from './services/error-handler.service';
import { LocalStorageService } from './services/local-storage.service';
import { ThemeService } from './services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    ...providers,
    I18N_PROVIDERS,
    ThemeService,
    LocalStorageService,
    provideRouter(routes),
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: ErrorHandler, useClass: OverseerErrorHandler },
    importProvidersFrom(...modules, I18NextModule.forRoot()),
  ],
};
