/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';

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
  static async read(timeout) {
    let queue = this.queue;
    let item = await queue.pop(timeout);
    if (!item) {
      return null;
    }
    let payload = item.payload;
    if (!payload) {
      let cache = this.cache;
      if (cache) {
        payload = await cache.get(item.id);
      }
    }
    let sled = new this();
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
  }

  /**
   * 将sled发送到队列
   * @param timeout
   */
  async send(timeout) {
    if (this.result || this.error) {
      throw new Error('can not send a finished sled');
    }
    //默认60天超时
    timeout = timeout || 60 * 86400;

    let data = this.data;
    if (this.toJSON) {
      data = this.toJSON();
    }

    let key = this.key;
    let id = this.id || 'sled.' + key + '.' + random(10);
    let payload = {
      data: data,
      name: this.name,
      key,
      timeout: timeout || 0,
      createdAt: new Date,
      expiredAt: new Date(Date.now() + timeout * 1000)
    };
    let item = {
      id,
      name: this.name,
      key
    };

    let cache = this.cache;
    if (cache) {
      await cache.set(id, payload);
    } else {
      item.payload = payload;
    }

    let queue = this.queue;
    await queue.push(item);
    return item;
  }

  /**
   * [async] 执行sled
   * @returns {*}
   */
  async run() {
    if (this.result !== undefined) {
      return this.result;
    }
    if (this.error) {
      throw this.error;
    }
    if (this.constructor._pre) {
      await collie.compose(this.constructor._pre, [], this);
    }

    let result;
    try {
      result = this.exec();
      if (result && result.then) {
        result = await result;
      }
    } catch (error) {
      this.error = error;
      this.run = function () {
        return Promise.reject(error);
      };
      return;
    }
    this.result = result;

    this.run = function () {
      return Promise.resolve(result);
    };

    if (this.constructor._post) {
      await collie.compose(this.constructor._post, [result], this);
    }

    return result;
  }

  /**
   * @method exec
   */
}

module.exports = Sled;
