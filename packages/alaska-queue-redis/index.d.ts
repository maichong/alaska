import QueueDriver, { QueueDriverOptions } from 'alaska-queue';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisQueueDriverOptions extends QueueDriverOptions, ClientOpts {
}

export default class RedisQueueDriver<T> extends QueueDriver<T, RedisQueueDriverOptions, RedisClient> {
}
