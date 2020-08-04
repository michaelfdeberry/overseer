declare const __isDev__: boolean;
declare const __isLocalApp__: boolean;
declare const __appVersion__: string;

declare module '*.svg' {
  import { FunctionComponent, SVGProps } from 'react';
  const _: FunctionComponent<SVGProps<HTMLOrSVGElement>>;
  export = _;
}
