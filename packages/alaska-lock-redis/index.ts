import * as Debugger from 'debug';
import { Service } from 'alaska';
import * as redis from 'redis';
import * as Redlock from 'redlock';
import LockDriver from 'alaska-lock';
import { RedisLockDriverOptions } from 'alaska-lock-redis';

const debug = Debugger('alaska-lock-memory');

export default class RedisLockDriver<T> extends LockDriver<T, RedisLockDriverOptions, Redlock> {
  _lock: Redlock.Lock;
  constructor(options: RedisLockDriverOptions, service: Service) {
    super(options, service);
    let servers = [];
    if (options.servers instanceof Array) {
      servers = options.servers.map((server: string) => redis.createClient(server));
    } else {
      servers.push(redis.createClient(<string>options.servers));
    }
    this._driver = new Redlock(servers, options);
  }

  lock(ttl?: number): Promise<void> {
    debug('lock');
    let resource = this.options.resource || this.service.panic('Missing resource for lock');
    ttl = ttl || this.options.ttl || 1000;
    return new Promise((resolve, reject) => {
      this._driver.lock(resource, ttl).then((lock) => {
        this._lock = lock;
        return resolve();
      }).catch((err) => reject(err));
    });
  }

  extend(ttl?: number): Promise<void> {
    debug('extend');
    ttl = ttl || this.options.ttl || 1000;
    return new Promise((resolve, reject) => {
      this._lock.extend(ttl).then((lock) => {
        this._lock = lock;
        return resolve();
      }).catch((err) => reject(err));
    });
  }

  unlock(): Promise<void> {
    debug('unlock');
    return new Promise((resolve, reject) => {
      this._lock.unlock()
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }
}
