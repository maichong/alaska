declare module 'depd' {
  declare function deprecate(message: string): void;

  declare var exports: (namespace: string) => deprecate;
}
