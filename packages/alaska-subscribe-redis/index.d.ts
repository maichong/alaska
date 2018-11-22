import SubscribeDriver, { SubscribeDriverOptions } from 'alaska-subscribe';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisSubscribeDriverOptions extends SubscribeDriverOptions, ClientOpts {
}

export default class RedisSubscribeDriver<T> extends SubscribeDriver<T, RedisSubscribeDriverOptions, RedisClient> {
}
