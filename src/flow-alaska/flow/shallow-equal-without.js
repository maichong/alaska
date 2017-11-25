declare module 'shallow-equal-without' {
  declare function shallowEqualWithout(objA: Object, objB: Object, ...without: string[]): boolean;

  declare var exports: shallowEqualWithout;
}
