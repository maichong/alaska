import * as Debugger from 'debug';
import { Service } from 'alaska';
import QueueDriver from 'alaska-queue';
import { ArrayQueueDriverOptions, ArrayQueueDriverType } from 'alaska-queue-array';

const debug = Debugger('alaska-queue-redis');

const queues: ArrayQueueDriverType<any> = {};

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

export default class RedisQueueDriver<T> extends QueueDriver<T, ArrayQueueDriverOptions, ArrayQueueDriverType<T>> {
  _key: string;
  _free: boolean;

  constructor(options: ArrayQueueDriverOptions, service: Service) {
    super(options, service);
    this._key = options.key;
    this._free = false;
    if (!queues[this._key]) {
      queues[this._key] = [];
    }
  }

  driver() {
    return queues;
  }

  /**
   * 将元素插入队列
   * @param {any} item
   * @returns {Promise<void>}
   */
  async push(item: T): Promise<void> {
    debug('push', item);
    this._free = false;
    queues[this._key].push(item);
  }

  /**
   * 读取队列中的元素
   * @param {number} [timeout] 时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  async pop(timeout?: number): Promise<T> {
    this._free = false;
    if (timeout === 0) {
      timeout = Infinity;
    }
    if (typeof timeout === 'undefined') {
      timeout = 0;
    }
    while (!queues[this._key].length && timeout > 0) {
      await sleep(1);
      timeout -= 1000;
      if (this._free) {
        return null;
      }
    }
    return queues[this._key].shift();
  }

  destroy() {
    //This package may cause memory leak.
  }
}
