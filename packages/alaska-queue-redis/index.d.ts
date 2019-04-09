import QueueDriver, { QueueDriverConfig } from 'alaska-queue';
import { ClientOpts, RedisClient } from 'redis';

export interface RedisQueueDriverConfig extends QueueDriverConfig, ClientOpts {
}

export default class RedisQueueDriver<T> extends QueueDriver<T, RedisQueueDriverConfig, RedisClient> {
}
