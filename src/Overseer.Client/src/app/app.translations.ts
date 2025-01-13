import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { ITranslationService, I18NEXT_SERVICE } from 'angular-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { environment } from '../environments/environment';

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next
      .use(HttpApi)
      .use(LanguageDetector)
      .init({
        backend: {
          loadPath: `/i18n/{{lng}}.json?v=${environment.appVersion}`,
        },
        supportedLngs: ['en'],
        fallbackLng: 'en',
        debug: true,
        returnEmptyString: false,
        ns: ['translation'],
      });
}

export function localeIdFactory(i18next: ITranslationService) {
  return i18next.language;
}

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory,
  },
];
