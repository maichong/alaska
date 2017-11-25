declare module 'string-random' {
  declare function random(length?: number, options?: boolean | {
    numbers?: string | boolean;
    letters?: string | boolean;
    specials?: string | boolean;
  }): string;

  declare var exports: random;
}
