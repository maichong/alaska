'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('alaska-cache-redis');

/* eslint new-cap:0 */

class RedisCacheDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfCacheDriver = true;
    this._maxAge = options.maxAge || 0;
    this._driver = _redis2.default.createClient(options);
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
    lifetime = lifetime === undefined ? this._maxAge : lifetime;
    return new Promise((resolve, reject) => {
      let args = [key, JSON.stringify(value)];
      if (lifetime) {
        args.push('PX', lifetime);
      }
      args.push(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      this._driver.set(...args);
    });
  }

  /**
   * 获取缓存
   * @param key
   * @returns {*}
   */
  get(key) {
    return new Promise((resolve, reject) => {
      this._driver.get(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          if (res !== null) {
            try {
              res = JSON.parse(res);
            } catch (err) {
              res = null;
            }
          }
          debug('get', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * 删除缓存
   * @param key
   */
  del(key) {
    debug('del', key);
    return new Promise((resolve, reject) => {
      this._driver.del(key, error => {
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
   * @param key
   * @returns {boolean}
   */
  has(key) {
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
   * 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key) {
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
   * 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key) {
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
   * @returns {number}
   */
  size() {
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
   */
  prune() {
    debug('prune');
    return Promise.resolve();
  }

  /**
   * 清空缓存
   */
  flush() {
    debug('flush');
    return new Promise((resolve, reject) => {
      this._driver.flushdb(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 空闲
   */
  onFree() {}

  /**
   * 销毁
   */
  onDestroy() {
    this._driver.quit();
    this._driver = {};
  }
}
exports.default = RedisCacheDriver;
RedisCacheDriver.classOfCacheDriver = true;