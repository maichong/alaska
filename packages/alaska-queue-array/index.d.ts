import QueueDriver, { QueueDriverConfig } from 'alaska-queue';
import { ClientOpts, RedisClient } from 'redis';

export interface ArrayQueueDriverType<T> {
  [x: string]: Array<T>;
}

export interface ArrayQueueDriverConfig extends QueueDriverConfig {
}

export default class ArrayQueueDriver<T> extends QueueDriver<T, ArrayQueueDriverConfig, ArrayQueueDriverType<T>> {
}
