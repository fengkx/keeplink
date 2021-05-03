/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '@metascraper/helpers' {
  export function toUrl($: any): string;
  export function title(): any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  export function toRule<T>(mapper: Function): (a: any) => T;
  export function $filter($: any, $$: any[]): any;
}
