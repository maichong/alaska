'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('alaska-cache-lru');

/* eslint new-cap:0 */

class LruCacheDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfCacheDriver = true;
    this._maxAge = options.maxAge || 0;
    this._driver = new _lruCache2.default(options);
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return this._driver;
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {*}
   */
  set(key, value, lifetime) {
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    return Promise.resolve(this._driver.set(key, value, lifetime));
  }

  /**
   * 获取缓存
   * @param key
   * @returns {*}
   */
  get(key) {
    let value = this._driver.get(key);
    debug('get', key, '=>', value);
    return Promise.resolve(value);
  }

  /**
   * 删除缓存
   * @param key
   */
  del(key) {
    debug('del', key);
    return Promise.resolve(this._driver.del(key));
  }

  /**
   * 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key) {
    let exists = this._driver.has(key);
    debug('has', key, '=>', exists);
    return Promise.resolve(exists);
  }

  /**
   * 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key) {
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
   * 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key) {
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
   * 返回缓存数量
   * @returns {number}
   */
  size() {
    debug('size', this._driver.itemCount);
    return Promise.resolve(this._driver.itemCount);
  }

  /**
   * 清理过期缓存
   */
  prune() {
    debug('prune');
    this._driver.prune();
    return Promise.resolve();
  }

  /**
   * 清空缓存
   */
  flush() {
    debug('flush');
    this._driver.reset();
    return Promise.resolve();
  }

  onDestroy() {
    this._driver.reset();
    this._driver = null;
  }
}
exports.default = LruCacheDriver;
LruCacheDriver.classOfCacheDriver = true;