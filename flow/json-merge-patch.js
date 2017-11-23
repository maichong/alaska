declare module 'json-merge-patch' {
  declare module .exports: {
    apply(obj: Object, patch: Object): Object;
    generate(source: Object, target: Object): Object;
    merge(patch1: Object, patch2: Object): Object;
  }
;
}
