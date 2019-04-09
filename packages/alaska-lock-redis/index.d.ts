import CacheDriver, { LockDriverConfig } from 'alaska-lock';
import { ClientOpts, RedisClient } from 'redis';
import * as Redlock from 'redlock';

type ServerConfig = string | ClientOpts;

export interface RedisLockDriverConfig extends LockDriverConfig {
  servers: ServerConfig | ServerConfig[];
}

export default class RedisLockDriver extends CacheDriver<RedisLockDriverConfig, Redlock> {
}
