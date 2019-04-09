import * as Debugger from 'debug';
import { Service } from 'alaska';
import * as redis from 'redis';
import * as Redlock from 'redlock';
import LockDriver from 'alaska-lock';
import { RedisLockDriverConfig } from '.';

const debug = Debugger('alaska-lock-redis');

export default class RedisLockDriver extends LockDriver<RedisLockDriverConfig, Redlock> {
  _lock: Redlock.Lock;
  _value: string | null;

  constructor(config: RedisLockDriverConfig, service: Service) {
    super(config, service);
    let servers = [];
    if (config.servers instanceof Array) {
      servers = config.servers.map((server: string) => redis.createClient(server));
    } else {
      servers.push(redis.createClient(<string>config.servers));
    }

    if (!config.retryCount) config.retryCount = 10;
    if (!config.retryDelay) config.retryDelay = 200;

    this._driver = new Redlock(servers, config);
  }

  async lock(ttl?: number): Promise<void> {
    let resource = this.config.resource;
    debug('lock', resource);
    if (!resource) {
      throw new Error('Missing resource for lock');
    }
    ttl = ttl || this.config.ttl || 2000;
    let lock = await this._driver.lock(resource, ttl);
    this._lock = lock;
    this._value = lock.value;
    debug('locked', resource, lock.value);
  }

  async extend(ttl?: number): Promise<void> {
    debug('extend', this.config.resource, this._value);
    ttl = ttl || this.config.ttl || 2000;
    let lock = await this._lock.extend(ttl);
    this._lock = lock;
    this._value = lock.value;
  }

  async unlock(): Promise<void> {
    debug('unlock', this.config.resource, this._value);
    await this._lock.unlock();
    this._value = null;
  }
}
