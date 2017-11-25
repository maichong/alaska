declare module 'alaska-cache-mongo' {
  declare class MongoCacheDriver {
    constructor(options?: Object): void;
    _maxAge: number;
    _connecting: Object | null;
    _driver: Object;
    type: string;
    isCacheDriver: boolean;
    noSerialization: boolean;
    driver(): any;
    set(key: string, value: any, lifetime?: number): Promise<any>;
    get(key: string): Promise<any>;
    del(key: string): any;
    has(key: string): Promise<boolean>;
    inc(key: string): Promise<number>;
    dec(key: string): Promise<number>;
    size(): number;
    prune(): any;
    flush(): any;
  }

  declare var exports: Class<MongoCacheDriver>;
}

