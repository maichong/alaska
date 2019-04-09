import { Driver, DriverConfig } from 'alaska';

export interface LockDriverConfig extends DriverConfig {
  resource: string;
  /**
   * 重试次数，默认 10
   */
  retryCount?: number;
  /**
   * 重试间隔，默认 200
   */
  retryDelay?: number;
  /**
   * 驱动默认锁定时间，默认 2000 毫秒
   */
  ttl?: number;
}

export default class LockDriver<C extends LockDriverConfig=any, D=any> extends Driver<C, D> {
  static readonly classOfLockDriver: true;
  readonly instanceOfLockDriver: true;
  readonly locked: boolean;

  /**
   * 锁定时间，默认 2000 毫秒
   * @param {number} ttl
   */
  lock(ttl?: number): Promise<void>;
  /**
   * 续期时间，默认 2000 毫秒
   * @param {number} ttl
   */
  extend(ttl?: number): Promise<void>;
  unlock(): Promise<void>;
}
