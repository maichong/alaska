declare namespace shallowEqualWithout {
  interface ShallowEqualWithout {
    (objA: Object, objB: Object, ...without: string[]): boolean;
  }
}

declare const shallowEqualWithout: shallowEqualWithout.ShallowEqualWithout;

export = shallowEqualWithout;
