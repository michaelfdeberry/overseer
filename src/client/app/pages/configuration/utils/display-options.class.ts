import { AccessLevel } from 'overseer_lib';

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
  new DisplayOption('Second', 1000),
  new DisplayOption('Seconds', 5000),
  new DisplayOption('Seconds', 10000),
  new DisplayOption('Seconds', 20000),
  new DisplayOption('Seconds', 30000),
];

export const accessLevels = [new DisplayOption('Readonly', AccessLevel.Readonly), new DisplayOption('Administrator', AccessLevel.Administrator)];
