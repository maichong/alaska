import CacheDriver, { LockDriverOptions } from 'alaska-lock';

export interface MemoryLockDriverOptions extends LockDriverOptions {
}

export interface Lock {
  id: string;
  expiredAt: number;
  timer: NodeJS.Timer;
}

export type LockMap = Map<string, Lock>;

export default class MemoryLockDriver<T> extends CacheDriver<T, MemoryLockDriverOptions, LockMap> {
}
