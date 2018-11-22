import { Driver, DriverOptions } from 'alaska';

export interface LockDriverOptions extends DriverOptions {
  resource: string;
  retryCount?: number;
  retryDelay?: number;
  ttl?: number;
}

export default class CacheDriver<T, O extends LockDriverOptions, D> extends Driver<O, D> {
  static readonly classOfLockDriver: true;
  readonly instanceOfLockDriver: true;
  readonly locked: boolean;

  lock(ttl?: number): Promise<void>;
  extend(ttl?: number): Promise<void>;
  unlock(): Promise<void>;
}
