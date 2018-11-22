import QueueDriver, { QueueDriverOptions } from 'alaska-queue';
import { ClientOpts, RedisClient } from 'redis';

export interface ArrayQueueDriverType<T> {
  [x: string]: Array<T>;
}

export interface ArrayQueueDriverOptions extends QueueDriverOptions {
}

export default class ArrayQueueDriver<T> extends QueueDriver<T, ArrayQueueDriverOptions, ArrayQueueDriverType<T>> {
}
