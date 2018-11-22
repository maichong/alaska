import CacheDriver, { CacheDriverOptions } from 'alaska-cache';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisCacheDriverOptions extends CacheDriverOptions, ClientOpts {
}

export default class RedisCacheDriver<T> extends CacheDriver<T, RedisCacheDriverOptions, RedisClient> {
}
