import CacheDriver, { LockDriverConfig } from 'alaska-lock';

export interface MemoryLockDriverConfig extends LockDriverConfig {
}

export interface Lock {
  id: string;
  expiredAt: number;
  timer: NodeJS.Timer;
}

export type LockMap = Map<string, Lock>;

export default class MemoryLockDriver extends CacheDriver<MemoryLockDriverConfig, LockMap> {
}
