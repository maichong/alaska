import CacheDriver, { CacheDriverConfig } from 'alaska-cache';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisCacheDriverConfig extends CacheDriverConfig, ClientOpts {
}

export default class RedisCacheDriver<T> extends CacheDriver<T, RedisCacheDriverConfig, RedisClient> {
}
