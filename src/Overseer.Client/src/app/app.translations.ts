import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { ITranslationService, I18NEXT_SERVICE } from 'angular-i18next';

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next.init({
      supportedLngs: ['en', 'ru'],
      fallbackLng: 'en',
      debug: true,
      returnEmptyString: false,
      ns: ['translation', 'validation', 'error'],
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
