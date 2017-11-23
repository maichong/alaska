declare module 'alaska-cache-lru' {
  declare class LruCacheDriver {
    constructor(options?: Object): void;
    _maxAge: number;
    _driver: any;
    type: string;
    isCacheDriver: boolean;
    noSerialization: boolean;
    driver(): any;
    set(key: string, value: any, lifetime?: number): Promise<any>;
    get(key: string): Promise<any>;
    del(key: string): Promise<any>;
    has(key: string): Promise<boolean>;
    inc(key: string): Promise<number>;
    dec(key: string): Promise<number>;
    size(): Promise<number>;
    prune(): Promise<void>;
    flush(): Promise<void>;
  }

  declare var exports: Class<LruCacheDriver>;
}
