declare module 'check-depends' {
  declare function checkDepends(depends: string | Object, data: Object): boolean;

  declare var exports: checkDepends;
}
