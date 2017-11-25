// @flow

import redis from 'redis';
import { Driver } from 'alaska';

export default class RedisQueueDriver extends Driver {
  static classOfQueueDriver = true;
  instanceOfQueueDriver = true;
  key: string;
  _driver: any;

  constructor(service: Alaska$Service, options: Object) {
    super(service, options);
    this.key = options.key;
    this._driver = redis.createClient(options);
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver(): any {
    return this._driver;
  }

  /**
   * 将元素插入队列
   * @param {*} item
   * @returns {Promise<void>}
   */
  push(item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this._driver.rpush(this.key, JSON.stringify(item), (error) => {
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
   * @param {number} [timeout] 超时时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  pop(timeout?: number): Promise<any> {
    let method = timeout === undefined ? 'lpop' : 'blpop';
    return new Promise((resolve, reject) => {
      let args = [this.key];
      if (method === 'blpop') {
        // $Flow
        args.push(parseInt(timeout / 1000));
      }
      args.push((error, res) => {
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
      });
      this._driver[method](...args);
    });
  }

  onFree() {
  }

  /**
   * 销毁队列
   */
  onDestroy() {
    this._driver.quit();
    this._driver = null;
  }
}
