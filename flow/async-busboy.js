declare module 'async-busboy' {
  declare function asyncBusboy(req: Object, options: Object): Promise<void>;

  declare var exports: asyncBusboy;
}
