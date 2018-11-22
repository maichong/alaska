import * as redis from 'redis';
import * as Debugger from 'debug';
import { Service } from 'alaska';
import QueueDriver from 'alaska-queue';
import { RedisQueueDriverOptions } from 'alaska-queue-redis';

const debug = Debugger('alaska-queue-redis');

type popMethod = 'lpop' | 'blpop';

export default class RedisQueueDriver<T> extends QueueDriver<T, RedisQueueDriverOptions, redis.RedisClient> {
  _key: string;

  constructor(options: RedisQueueDriverOptions, service: Service) {
    super(options, service);
    this._key = options.key;
    this._driver = redis.createClient(options);
  }

  /**
   * 将元素插入队列
   * @param {any} item
   * @returns {Promise<void>}
   */
  push(item: T): Promise<void> {
    debug('push', item);
    return new Promise((resolve, reject) => {
      this._driver.rpush(this._key, JSON.stringify(item), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 读取队列中的元素
   * @param {number} [timeout] 时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  pop(timeout?: number): Promise<T> {
    let method: popMethod = typeof timeout === 'undefined' ? 'lpop' : 'blpop';
    return new Promise((resolve, reject) => {
      let callback = (error: Error, res: any) => {
        if (error) {
          reject(error);
        } else {
          if (res !== null) {
            try {
              if (Array.isArray(res)) {
                res = res[1];
              }
              res = JSON.parse(res);
            } catch (err) {
              res = null;
            }
          }
          resolve(res);
        }
      };
      if (method === 'lpop') {
        this._driver.lpop(this._key, callback);
      } else {
        this._driver.blpop(this._key, Math.floor(timeout / 1000), callback);
      }
    });
  }

  destroy() {
    this._driver.quit();
    this._driver = null;
  }

}
