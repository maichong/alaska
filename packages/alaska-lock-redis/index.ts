import * as Debugger from 'debug';
import { Service } from 'alaska';
import * as redis from 'redis';
import * as Redlock from 'redlock';
import LockDriver from 'alaska-lock';
import { RedisLockDriverOptions } from 'alaska-lock-redis';

const debug = Debugger('alaska-lock-redis');

export default class RedisLockDriver extends LockDriver<RedisLockDriverOptions, Redlock> {
  _lock: Redlock.Lock;
  _value: string | null;

  constructor(options: RedisLockDriverOptions, service: Service) {
    super(options, service);
    let servers = [];
    if (options.servers instanceof Array) {
      servers = options.servers.map((server: string) => redis.createClient(server));
    } else {
      servers.push(redis.createClient(<string>options.servers));
    }

    if (!options.retryCount) options.retryCount = 10;
    if (!options.retryDelay) options.retryDelay = 200;

    this._driver = new Redlock(servers, options);
  }

  async lock(ttl?: number): Promise<void> {
    let resource = this.options.resource;
    debug('lock', resource);
    if (!resource) {
      throw new Error('Missing resource for lock');
    }
    ttl = ttl || this.options.ttl || 2000;
    let lock = await this._driver.lock(resource, ttl);
    this._lock = lock;
    this._value = lock.value;
    debug('locked', resource, lock.value);
  }

  async extend(ttl?: number): Promise<void> {
    debug('extend', this.options.resource, this._value);
    ttl = ttl || this.options.ttl || 2000;
    let lock = await this._lock.extend(ttl);
    this._lock = lock;
    this._value = lock.value;
  }

  async unlock(): Promise<void> {
    debug('unlock', this.options.resource, this._value);
    await this._lock.unlock();
    this._value = null;
  }
}
