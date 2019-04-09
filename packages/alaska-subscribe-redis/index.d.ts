import SubscribeDriver, { SubscribeDriverConfig } from 'alaska-subscribe';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisSubscribeDriverConfig extends SubscribeDriverConfig, ClientOpts {
}

export default class RedisSubscribeDriver<T> extends SubscribeDriver<T, RedisSubscribeDriverConfig, RedisClient> {
}
