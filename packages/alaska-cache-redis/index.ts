import * as redis from 'redis';
import * as Debugger from 'debug';
import { Service } from 'alaska';
import CacheDriver from 'alaska-cache';
import { RedisCacheDriverConfig } from 'alaska-cache-redis';

const debug = Debugger('alaska-cache-redis');

export default class RedisCacheDriver<T> extends CacheDriver<T, RedisCacheDriverConfig, redis.RedisClient> {
  _maxAge: number;

  constructor(config: RedisCacheDriverConfig, service: Service) {
    super(config, service);
    this._maxAge = config.maxAge || 0;
    this._driver = redis.createClient(config);
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {any} value
   * @param {number} [lifetime] 超时时间，为0则永不过期，默认按驱动初始化参数maxAge而定，单位毫秒
   * @returns {Promise<void>}
   */
  set(key: string, value: T, lifetime?: number): Promise<void> {
    debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
    let ms: number = typeof lifetime === 'undefined' ? this._maxAge : lifetime;
    return new Promise((resolve, reject) => {
      let args: Array<any> = [key, JSON.stringify(value)];
      if (ms) {
        args.push('PX', ms);
      }
      args.push((error: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      this._driver.set.apply(this._driver, args);
    });
  }

  /**
   * 获取缓存
   * @param {string} key
   * @returns {Promise<any>}
   */
  get(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this._driver.get(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          let obj: T;
          if (res !== null) {
            try {
              obj = JSON.parse(res);
            } catch (err) {
              obj = null;
            }
          }
          debug('get', key, '=>', obj);
          resolve(obj);
        }
      });
    });
  }

  /**
   * 删除缓存
   * @param {string} key
   * @returns {Promise<void>}
   */
  del(key: string): Promise<void> {
    debug('del', key);
    return new Promise((resolve, reject) => {
      this._driver.del(key, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 判断缓存键是否存在
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  has(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._driver.exists(key, (error, exists) => {
        if (error) {
          reject(error);
        } else {
          debug('has', key, '=>', !!exists);
          resolve(!!exists);
        }
      });
    });
  }

  /**
   * 自增并返回结果，如果key不存在则创建，并返回1
   * @param {string} key
   * @returns {Promise<number>}
   */
  inc(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.incr(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          debug('inc', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * 自减并返回结果，如果key不存在则创建，并返回-1
   * @param {string} key
   * @returns {Promise<number>}
   */
  dec(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.decr(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          debug('inc', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * 返回缓存数量
   * @returns {Promise<number>}
   */
  size(): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.dbsize((error, size) => {
        if (error) {
          reject(error);
        } else {
          debug('size', size);
          resolve(size);
        }
      });
    });
  }

  /**
   * 清理过期缓存
   * @returns {Promise<void>}
   */
  prune(): Promise<void> {
    debug('prune');
    return Promise.resolve();
  }

  /**
   * 清空缓存
   * @returns {Promise<void>}
   */
  flush(): Promise<void> {
    debug('flush');
    return new Promise((resolve, reject) => {
      this._driver.flushdb((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 销毁
   */
  destroy() {
    this._driver.quit();
    this._driver = null;
  }
}
