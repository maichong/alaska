import CacheDriver, { LockDriverOptions } from 'alaska-lock';
import { ClientOpts, RedisClient } from 'redis';
import * as Redlock from 'redlock';

type ServerConfig = string | ClientOpts;

export interface RedisLockDriverOptions extends LockDriverOptions {
  servers: ServerConfig | ServerConfig[];
}

export default class RedisLockDriver extends CacheDriver<RedisLockDriverOptions, Redlock> {
}
