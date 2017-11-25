declare module 'alaska-cache-redis' {
  declare class RedisCacheDriver {
    constructor(options?: Object): void;
    classOfCacheDriver: boolean;
    instanceOfCacheDriver: true;
    _maxAge: number;
    _driver: Object;
    type: string;
    isCacheDriver: boolean;
    noSerialization: boolean;
    driver(): any;
    set(key: string, value: any, lifetime?: number): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
    has(key: string): Promise<boolean>;
    inc(key: string): Promise<number>;
    dec(key: string): Promise<number>;
    size(): Promise<number>;
    prune(): Promise<void>;
    flush(): Promise<void>;
  }

  declare var exports: Class<RedisCacheDriver>;
}

