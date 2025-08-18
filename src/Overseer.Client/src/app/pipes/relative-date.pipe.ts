import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'relativeDate',
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: number | string | Date): string {
    if (!value) return '';

    let dateTime: DateTime;

    if (typeof value === 'number') {
      // Assume unix epoch (seconds or milliseconds)
      dateTime = value > 1e12 ? DateTime.fromMillis(value) : DateTime.fromSeconds(value);
    } else if (value instanceof Date) {
      dateTime = DateTime.fromJSDate(value);
    } else if (typeof value === 'string') {
      dateTime = DateTime.fromISO(value, { setZone: true });
      if (!dateTime.isValid) {
        // Try parsing as RFC2822 or HTTP
        dateTime = DateTime.fromRFC2822(value);
        if (!dateTime.isValid) {
          dateTime = DateTime.fromHTTP(value);
        }
      }
    } else {
      return '';
    }

    if (!dateTime.isValid) return '';

    return dateTime.toRelative() ?? '';
  }
}
