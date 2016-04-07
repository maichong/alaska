/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

import collie from 'collie';
import random from 'string-random';

export default class Sled {

  /**
   * Sled构造函数
   * @param {Object} [data]
   */
  constructor(data) {
    this.data = data || {};
    //队列item数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.item = null;
    //队列缓存扩展信息数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.payload = null;
    //执行结果
    this.result = null;
    //错误
    this.error = null;
  }

  /**
   * 获取sled所属service
   * @returns {Service}
   */
  get service() {
    return this.constructor.service;
  }

  /**
   * 获取Sled name
   * @returns {string}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * 获取Sled key
   * @returns {string}
   */
  get key() {
    return this.constructor.key;
  }

  /**
   * 获取sled配置
   * @private
   * @returns {Object}
   */
  get config() {
    return this.constructor.config;
  }

  /**
   * 获取缓存驱动
   * @private
   * @returns {RedisCacheDriver|boolean}
   */
  createCacheDriver() {
    return this.constructor.createCacheDriver();
  }

  /**
   * 获取队列驱动
   * @private
   * @returns {RedisQueueDriver}
   */
  createQueueDriver() {
    return this.constructor.createQueueDriver();
  }

  /**
   * 获取队列驱动
   * @private
   * @returns {RedisSubscribeDriver}
   */
  createSubscribeDriver(id) {
    return this.constructor.createSubscribeDriver(id);
  }

  /**
   * 注册 Sled 前置钩子
   * @param fn
   */
  static pre(fn) {
    if (!this._pre) {
      this._pre = [];
    }
    this._pre.push(fn);
  }

  /**
   * 注册 Sled 后置钩子
   * @param fn
   */
  static post(fn) {
    if (!this._post) {
      this._post = [];
    }
    this._post.push(fn);
  }

  /**
   * 获取Sled设置
   * @private
   * @returns {Object}
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
      throw new ReferenceError('sled config not found');
    }
    return this._config;
  }

  /**
   * 获取Sled数据缓存驱动
   * @private
   * @returns {RedisCacheDriver|boolean}
   */
  static createCacheDriver() {
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
   * @private
   * @returns {RedisQueueDriver}
   */
  static createQueueDriver() {
    let config = this.config;
    if (!config.queue) {
      throw new ReferenceError('sled queue config not found');
    }
    let QueueDriver = require(config.queue.type);
    return new QueueDriver(this.key, config.queue);
  }

  /**
   * 获取Sled订阅驱动
   * @private
   * @returns {RedisSubscribeDriver}
   */
  static createSubscribeDriver(id) {
    let config = this.config;
    if (!config.subscribe) {
      throw new ReferenceError('sled subscribe config not found');
    }
    let SubscribeDriver = require(config.subscribe.type);
    return new SubscribeDriver(id, config.subscribe);
  }

  /**
   * [async] alias for sled.run()
   * @param {Object} [data]
   * @returns {*}
   */
  static run(data) {
    let sled = new this(data);
    return sled.run();
  }

  /**
   * 从队列中读取一个sled
   * @param {number} [timeout] 读取超时,单位秒,默认Infinity
   */
  static async read(timeout) {
    let queue = this.createQueueDriver();
    let item = await queue.pop(timeout);
    if (!item) {
      return null;
    }
    let payload = item.payload;
    if (!payload) {
      let cache = this.createCacheDriver();
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
    sled.payload = payload;
    sled.fromQueue = true;
    sled.item = item;
    sled.id = item.id;
    return sled;
  }

  /**
   * 将sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  async send(timeout, notify) {
    if (this.result || this.error) {
      throw new Error('can not send a finished sled');
    }
    //如果已经有item属性,代表已经发送到队列,或者是从队列中读取的sled
    if (this.item) {
      return this.item;
    }
    //默认60天超时
    timeout = timeout || 60 * 86400;

    let data = this.data;
    if (this.toJSON) {
      data = this.toJSON();
    }

    let key = this.key;
    let id = this.id;
    if (!id) {
      id = this.id = 'sled.' + key + '.' + random(10);
    }
    let payload = this.payload = {
      id,
      key,
      notify,
      data,
      name: this.name,
      result: null,
      error: null,
      timeout: timeout || 0,
      createdAt: new Date,
      expiredAt: new Date(Date.now() + timeout * 1000)
    };
    let item = this.item = {
      id,
      name: this.name,
      key
    };

    let cache = this.createCacheDriver();
    if (cache) {
      await cache.set(id, payload);
    } else {
      item.payload = payload;
    }

    let queue = this.createQueueDriver();
    await queue.push(item);

    return item;
  }

  /**
   * [async]等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位秒,默认为60天
   */
  async wait(waitTimeout, sledTimeout) {
    if (this.result) {
      return this.result;
    }
    if (this.error) {
      throw this.error;
    }

    let id = this.id;
    if (!id) {
      id = this.id = 'sled.' + this.key + '.' + random(10);
    }
    let subscribe = this.createSubscribeDriver(id);

    if (!this.item) {
      //异步将sled插入队列
      this.send(sledTimeout, true);
    }

    let msg = await subscribe.once(waitTimeout);
    if (!msg) {
      return msg;
    }
    let cache = this.createCacheDriver();
    if (cache) {
      let payload = await cache.get(id);
      if (payload) {
        this.payload = payload;
      }
    } else {
      //没有将数据放入缓存
      this.payload.result = msg.result;
      this.payload.error = msg.error;
    }
    if (this.payload.error) {
      this.error = new Error(this.payload.error);
      throw this.error;
    }
    this.result = this.payload.result;
    return this.result;
  }

  /**
   * 将运行后的状态更新到缓存
   * @private
   */
  async update() {
    let payload = this.payload;
    if (!payload) {
      return;
    }
    payload.result = this.result;
    if (this.error) {
      payload.error = this.error.message;
    }

    let cache = this.createCacheDriver();
    if (cache) {
      await cache.set(this.item.id, payload);
    }
    if (payload.notify) {
      let subscribe = this.createSubscribeDriver(payload.id);
      await subscribe.publish({
        id: payload.id,
        error: payload.error,
        result: payload.result
      });
    }
  }

  /**
   * [async] 执行sled
   * @returns {*}
   */
  async run() {
    if (this.error) {
      throw this.error;
    }
    if (this.result !== null) {
      return this.result;
    }
    if (this.validate) {
      let promise = this.validate(this.data);
      if (promise && promise.then) {
        await promise();
      }
    }
    if (this.constructor._pre) {
      await collie.compose(this.constructor._pre, [], this);
    }

    let result = this.result;
    //如果已经有result,说明在前置hooks中已经执行完成任务
    if (!this.result) {
      try {
        result = this.exec(this.data);
        if (result && result.then) {
          result = await result;
        }
      } catch (error) {
        this.error = error;
        this.payload && this.update();
        throw error;
      }
      this.result = result;
    }
    this.payload && this.update();

    if (this.constructor._post) {
      await collie.compose(this.constructor._post, [result], this);
    }

    return result;
  }

  /**
   * @method validate
   */

  /**
   * @method exec
   */
}
