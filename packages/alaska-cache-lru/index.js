// @flow

import LRU from 'lru-cache';
import _debug from 'debug';

const debug = _debug('alaska-cache-lru');

export default class LruCacheDriver {
  _maxAge: number;
  _driver: any;
  type: string;
  isCacheDriver: boolean;
  noSerialization: boolean;
  constructor(options: Object) {
    this._maxAge = options.maxAge || 0;
    this._driver = new LRU(options);
    this.type = 'lru';
    //标识已经是缓存对象实例
    this.isCacheDriver = true;
    //标识本驱动不会序列化数据
    this.noSerialization = true;
  }

  /**
   * @returns {LRUCache}
   */
  driver() {
    return this._driver;
  }

  /**
   * [async] 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {*}
   */
  set(key: string, value: any, lifetime?: number): Promise<any> {
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    return Promise.resolve(this._driver.set(key, value, lifetime));
  }

  /**
   * [async] 获取缓存
   * @param key
   * @returns {*}
   */
  get(key: string): Promise<any> {
    let value = this._driver.get(key);
    debug('get', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 删除缓存
   * @param key
   */
  del(key: string):Promise<any> {
    debug('del', key);
    return Promise.resolve(this._driver.del(key));
  }

  /**
   * [async] 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key: string): Promise<boolean> {
    let exists = this._driver.has(key);
    debug('has', key, '=>', exists);
    return Promise.resolve(exists);
  }

  /**
   * [async] 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key: string): Promise<number> {
    let value = this._driver.get(key);
    if (!value) {
      value = 0;
    }
    value += 1;
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key: string): Promise<number> {
    let value = this._driver.get(key);
    if (!value) {
      value = 0;
    }
    value -= 1;
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 返回缓存数量
   * @returns {number}
   */
  size(): Promise<number> {
    debug('size', this._driver.itemCount);
    return Promise.resolve(this._driver.itemCount);
  }

  /**
   * [async] 清理过期缓存
   */
  prune(): Promise<void> {
    debug('prune');
    this._driver.prune();
    return Promise.resolve();
  }

  /**
   * [async] 清空缓存
   */
  flush(): Promise<void> {
    debug('flush');
    this._driver.reset();
    return Promise.resolve();
  }
}
