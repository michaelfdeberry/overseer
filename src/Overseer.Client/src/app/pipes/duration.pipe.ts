import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (!value) return 'n/a';

    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);

    return h + 'h ' + m + 'm';
  }
}
