import * as LRUCache from 'lru-cache';
import * as Debugger from 'debug';
import { Service } from 'alaska';
import CacheDriver from 'alaska-cache';
import { LruCacheDriverConfig } from 'alaska-cache-lru';

const debug = Debugger('alaska-cache-lru');

export default class LruCacheDriver<T> extends CacheDriver<T, LruCacheDriverConfig<T>, LRUCache<string, T>> {
  _maxAge: number;

  constructor(config: LruCacheDriverConfig<T>, service: Service) {
    super(config, service);
    this._maxAge = config.maxAge || 0;
    this._driver = new LRUCache(config);
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {Promise<any>}
   */
  set(key: string, value: T, lifetime?: number): Promise<any> {
    debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
    return Promise.resolve(this._driver.set(key, value, lifetime));
  }

  /**
   * 获取缓存
   * @param  {string} key
   * @returns {Promise<any>}
   */
  get(key: string): Promise<T> {
    let value = this._driver.get(key);
    debug('get', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * 删除缓存
   * @param {string} key
   * @returns {Promise<any>}
   */
  del(key: string): Promise<any> {
    debug('del', key);
    return Promise.resolve(this._driver.del(key));
  }

  /**
   * 判断缓存键是否存在
   * @param {string} key
   *@returns {Promise<boolean>}
   */
  has(key: string): Promise<boolean> {
    let exists = this._driver.has(key);
    debug('has', key, '=>', exists);
    return Promise.resolve(exists);
  }

  /**
   * 自增并返回结果
   * @param {string} key
   * @returns {Promise<number>}
   */
  inc(key: string): Promise<number> {
    // @ts-ignore T -> number
    let value = this._driver.get(key) as number;
    if (!value) {
      value = 0;
    }
    value += 1;
    // @ts-ignore number -> T
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * 自减并返回结果
   * @param {string} key
   * @returns {Promise<number>}
   */
  dec(key: string): Promise<number> {
    // @ts-ignore T -> number
    let value = this._driver.get(key) as number;
    if (!value) {
      value = 0;
    }
    value -= 1;
    // @ts-ignore number -> T
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * 返回缓存数量
   * @returns {Promise<number>}
   */
  size(): Promise<number> {
    debug('size', this._driver.itemCount);
    return Promise.resolve(this._driver.itemCount);
  }

  /**
   * 清理过期缓存
   * @returns {Promise<void>}
   */
  prune(): Promise<void> {
    debug('prune');
    this._driver.prune();
    return Promise.resolve();
  }

  /**
   * 清空缓存
   * @returns {Promise<void>}
   */
  flush(): Promise<void> {
    debug('flush');
    this._driver.reset();
    return Promise.resolve();
  }

  destroy() {
    this._driver.reset();
    this._driver = null;
  }
}
