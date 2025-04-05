import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18NextService } from 'angular-i18next';

@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  private i18NextService = inject(I18NextService);

  transform(value: number | undefined): string {
    if (!value) return this.i18NextService.t('nonApplicable');

    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);

    return h + 'h ' + m + 'm';
  }
}
