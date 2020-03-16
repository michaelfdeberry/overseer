import { AccessLevel } from '@overseer/common/models';

import { themeMap } from '../../../themes';

export class DisplayOption<TValue> {
  constructor(public text: string, public value: TValue) {}
}

export const sessionLifetimes = [
  new DisplayOption('Indefinite', 0),
  new DisplayOption('1 Day', 1),
  new DisplayOption('7 Days', 7),
  new DisplayOption('30 Days', 30),
  new DisplayOption('90 Days', 90),
];

export const pollIntervals = [
  new DisplayOption('1 Second', 1000),
  new DisplayOption('5 Seconds', 5000),
  new DisplayOption('10 Seconds', 10000),
  new DisplayOption('20 Seconds', 20000),
  new DisplayOption('30 Seconds', 30000),
];

export const accessLevels = [new DisplayOption('Readonly', AccessLevel.Readonly), new DisplayOption('Administrator', AccessLevel.Administrator)];

export const themeOptions = Object.keys(themeMap).map(theme => new DisplayOption(theme, theme));
