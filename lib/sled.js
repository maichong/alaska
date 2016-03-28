/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const collie = require('collie');

const util = require('./util');

const random = require('string-random');

class Sled {

  constructor(data) {
    this.data = data || {};
  }

  get service() {
    return this.constructor.service;
  }

  get name() {
    return this.constructor.name;
  }

  get key() {
    return this.constructor.key;
  }

  get config() {
    return this.constructor.config;
  }

  get cache() {
    return this.constructor.cache;
  }

  get queue() {
    return this.constructor.queue;
  }

  static pre(fn) {
    if (!this._pre) {
      this._pre = [];
    }
    this._pre.push(fn);
  }

  static post(fn) {
    if (!this._post) {
      this._post = [];
    }
    this._post.push(fn);
  }

  /**
   * 获取Sled设置
   * @returns {{}}
   */
  static get config() {
    if (!this._config) {
      let service = this.service;
      let key = this.key;
      let name = 'sled.' + key;
      let config = service.config(true, name);
      if (!config) {
        config = service.config(true, 'sled');
      }
      this._config = config;
    }
    if (!this._config) {
      throw new ReferenceError('sled queue config not found');
    }
    return this._config;
  }

  /**
   * 获取Sled数据缓存驱动
   * @returns {boolean|{}}
   */
  static get cache() {
    if (!this._cache && this._cache !== false) {
      let config = this.config;
      let cache = false;
      if (config.cache) {
        let CacheDriver = require(config.cache.type);
        cache = new CacheDriver(config.cache);
      }
      this._cache = cache;
    }
    return this._cache;
  }

  /**
   * 获取Sled队列驱动
   * @returns {*}
   */
  static get queue() {
    let config = this.config;
    let QueueDriver = require(config.queue.type);
    return QueueDriver.instance(this.key, config.queue);
  }

  /**
   * 从队列中读取一个sled
   * @param timeout
   */
  static read(timeout) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let queue = _this.queue;
      let item = yield queue.pop(timeout);
      if (!item) {
        return null;
      }
      let payload = item.payload;
      if (!payload) {
        let cache = _this.cache;
        if (cache) {
          payload = yield cache.get(item.id);
        }
      }
      let sled = new _this();
      if (sled.fromJSON) {
        sled.fromJSON(payload.data);
      } else {
        sled.data = payload.data;
      }
      if (payload.result !== undefined) {
        sled.result = payload.result;
      } else if (payload.error) {
        sled.error = new Error(payload.error);
      }
      sled.fromQueue = true;
      sled.item = item;
      return sled;
    })();
  }

  /**
   * 将sled发送到队列
   * @param timeout
   */
  send(timeout) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.result || _this2.error) {
        throw new Error('can not send a finished sled');
      }
      //默认60天超时
      timeout = timeout || 60 * 86400;

      let data = _this2.data;
      if (_this2.toJSON) {
        data = _this2.toJSON();
      }

      let key = _this2.key;
      let id = _this2.id || 'sled.' + key + '.' + random(10);
      let payload = {
        data: data,
        name: _this2.name,
        key,
        timeout: timeout || 0,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + timeout * 1000)
      };
      let item = {
        id,
        name: _this2.name,
        key
      };

      let cache = _this2.cache;
      if (cache) {
        yield cache.set(id, payload);
      } else {
        item.payload = payload;
      }

      let queue = _this2.queue;
      yield queue.push(item);
      return item;
    })();
  }

  /**
   * [async] 执行sled
   * @returns {*}
   */
  run() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (_this3.result !== undefined) {
        return _this3.result;
      }
      if (_this3.error) {
        throw _this3.error;
      }
      if (_this3.constructor._pre) {
        yield collie.compose(_this3.constructor._pre, [], _this3);
      }

      let result;
      try {
        result = _this3.exec();
        if (result && result.then) {
          result = yield result;
        }
      } catch (error) {
        _this3.error = error;
        _this3.run = function () {
          return Promise.reject(error);
        };
        return;
      }
      _this3.result = result;

      _this3.run = function () {
        return Promise.resolve(result);
      };

      if (_this3.constructor._post) {
        yield collie.compose(_this3.constructor._post, [result], _this3);
      }

      return result;
    })();
  }

  /**
   * @method exec
   */
}

module.exports = Sled;