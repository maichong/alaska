const LRU = require('lru-cache');
const _ = require('lodash');
const debug = require('debug')('alaska-cache-lru');

class LruCacheDriver {
  constructor(options) {
    this._maxAge = options.maxAge || 0;
    this._driver = LRU(options);
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
  set(key: string, value: any, lifetime?: number) {
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    return Promise.resolve(this._driver.set(key, value, lifetime));
  }

  /**
   * [async] 获取缓存
   * @param key
   * @returns {*}
   */
  get(key: string) {
    let value = this._driver.get(key);
    debug('get', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 删除缓存
   * @param key
   */
  del(key: string) {
    debug('del', key);
    return Promise.resolve(this._driver.del(key));
  }

  /**
   * [async] 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key: string) {
    let exists = this._driver.has(key);
    debug('has', key, '=>', exists);
    return Promise.resolve(exists);
  }

  /**
   * [async] 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key: string) {
    let value = this._driver.get(key);
    if (!value) {
      value = 0;
    }
    value++;
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key: string) {
    let value = this._driver.get(key);
    if (!value) {
      value = 0;
    }
    value--;
    this._driver.set(key, value);
    debug('inc', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * [async] 返回缓存数量
   * @returns {number}
   */
  size() {
    debug('size', this._driver.itemCount);
    return Promise.resolve(this._driver.itemCount);
  }

  /**
   * [async] 清理过期缓存
   */
  prune() {
    debug('prune');
    this._driver.prune();
    return Promise.resolve();
  }

  /**
   * [async] 清空缓存
   */
  flush() {
    debug('flush');
    this._driver.reset();
    return Promise.resolve();
  }
}

LruCacheDriver.default = LruCacheDriver;

module.exports = LruCacheDriver;
