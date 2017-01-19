declare module 'alaska-cache-memcache' {
  declare class MemcacheCacheDriver {
  constructor(options?: Object):void;
  _maxAge: number;
  _options: Object;
  type: string;
  isCacheDriver: boolean;
  noSerialization: boolean;
  _connect: Function;
  _connecting: any;
  _driver: any;
  _connect(): any;
  driver(): any;
  set(key: string, value: any, lifetime?: number): Promise<any>;
  get(key:string): Promise<any>;
  del(key:string): Promise<any>;
  has(key:string): Promise<boolean>;
  inc(key:string): Promise<number>;
  dec(key:string): Promise<number>;
  size(): Promise<number>;
  prune(): Promise<void>;
  flush(): Promise<any>;
  }
  declare var exports: MemcacheCacheDriver;
}
