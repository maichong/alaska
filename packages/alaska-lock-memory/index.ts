import * as Debugger from 'debug';
import { Service } from 'alaska';
import LockDriver from 'alaska-lock';
import * as random from 'string-random';
import delay from 'delay';
import { MemoryLockDriverOptions, LockMap } from 'alaska-lock-memory';

const debug = Debugger('alaska-lock-memory');
const locks: LockMap = new Map();

export default class MemoryLockDriver<T> extends LockDriver<T, MemoryLockDriverOptions, LockMap> {
  id: string;

  constructor(options: MemoryLockDriverOptions, service: Service) {
    super(options, service);
    this._driver = locks;
    this.id = '';
  }

  lock(ttl?: number): Promise<void> {
    if (this.locked || this.id) return Promise.reject(new Error('Aready locked'));
    let retryCount = this.options.retryCount || 10;
    let retryDelay = this.options.retryDelay || 200;
    let resource = this.options.resource;
    if (!resource) {
      throw new Error('Missing resource for lock');
    }
    ttl = ttl || this.options.ttl || 1000;
    let id = random();
    this.id = id;
    let me = this;
    function tryLock(): Promise<void> {
      let item = locks.get(resource);
      if (!item) {
        let now = Date.now();
        item = {
          id,
          expiredAt: now + ttl,
          timer: global.setTimeout(() => {
            let cur = locks.get(resource);
            if (cur && cur.id === id) {
              locks.delete(resource);
              // @ts-ignore readonly
              me.locked = false;
              me.id = '';
              debug(`lock timeout ${resource}`);
            }
          }, ttl)
        };
        locks.set(resource, item);
        // @ts-ignore readonly
        me.locked = true;
        debug(`locked ${resource}`);
        return Promise.resolve();
      }

      // 已经存在锁
      retryCount -= 1;
      if (retryCount < 1) {
        me.id = '';
        return Promise.reject(new Error('Lock failed!'));
      }

      return delay(retryDelay).then(tryLock);
    }
    return tryLock();
  }

  extend(ttl?: number): Promise<void> {
    if (!this.locked) return Promise.reject(new Error('Extend lock failed, not locked yet.'));
    let resource = this.options.resource;
    let item = locks.get(resource);
    if (!item || item.id !== this.id) return Promise.reject(new Error('Extend lock failed.'));
    ttl = ttl || this.options.ttl || 1000;
    clearTimeout(item.timer);
    item.expiredAt += ttl;
    let me = this;
    item.timer = global.setTimeout(() => {
      let cur = locks.get(resource);
      if (cur && cur.id === me.id) {
        locks.delete(resource);
        me.id = '';
        // @ts-ignore readonly
        me.locked = false;
        debug(`lock timeout ${resource}`);
      }
    }, item.expiredAt - Date.now());
    debug(`extend lock ${resource} ${ttl}`);
    return Promise.resolve();
  }

  unlock(): Promise<void> {
    if (!this.locked) return Promise.resolve();
    let resource = this.options.resource;
    let item = locks.get(resource);
    let id = this.id;
    this.id = '';
    // @ts-ignore readonly
    this.locked = false;
    if (item && item.id === id) {
      clearTimeout(item.timer);
      locks.delete(resource);
      debug(`unlock ${resource}`);
    }
    return Promise.resolve();
  }
}
