// @flow

import collie from 'collie';
import random from 'string-random';
import _ from 'lodash';

export default class Sled {
  static service: Alaska$Service;
  static name: string;
  static key: string;
  static _pre: Function[];
  static _post: Function[];
  static _config: Object;

  id: string;
  params: Object;
  item: null|Alaska$sledQueueItem;
  fromQueue: boolean;
  result: void|any;
  error: void|Error;
  fromJSON: void|((params: Object) => void);
  toJSON: void|(() => Object);
  exec: ((params: Object) => Promise<any>);
  validate: (() => Promise<any>);

  /**
   * Sled构造函数
   * @param {Object} [params]
   */
  constructor(params?: Object) {
    this.params = params || {};
    //队列item数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.item = null;
    //执行结果
    this.result = undefined;
    //错误
    this.error = undefined;
  }

  /**
   * 获取sled所属service
   * @returns {Service}
   */
  get service(): Alaska$Service {
    return this.constructor.service;
  }

  /**
   * 获取Sled name
   * @returns {string}
   */
  get name(): string {
    return this.constructor.name;
  }

  /**
   * 获取Sled key
   * @returns {string}
   */
  get key(): string {
    return this.constructor.key;
  }

  /**
   * 获取sled配置
   * @private
   * @returns {Object}
   */
  get config(): Object {
    return this.constructor.config;
  }

  /**
   * 获取队列驱动
   * @private
   * @returns {Alaska$QueueDriver}
   */
  createQueueDriver(): Alaska$QueueDriver {
    return this.constructor.createQueueDriver();
  }

  /**
   * 获取订阅驱动
   * @private
   * @param {string} channel 频道ID
   * @returns {Alaska$SubscribeDriver}
   */
  createSubscribeDriver(channel: string): Alaska$SubscribeDriver {
    return this.constructor.createSubscribeDriver(channel);
  }

  /**
   * 注册 Sled 前置钩子
   * @param fn
   */
  static pre(fn: Function) {
    if (!this._pre) {
      this._pre = [];
    }
    this._pre.push(fn);
  }

  /**
   * 注册 Sled 后置钩子
   * @param fn
   */
  static post(fn: Function) {
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
      let config = service.config(name, undefined, true);
      if (!config) {
        config = service.config('sled', undefined, true);
      }
      this._config = config;
    }
    if (!this._config) {
      throw new ReferenceError('sled config not found');
    }
    return this._config;
  }

  /**
   * 获取Sled队列驱动
   * @private
   * @returns {Alaska$QueueDriver}
   */
  static createQueueDriver(): Alaska$QueueDriver {
    let config = this.config;
    if (!config.queue) {
      throw new ReferenceError('sled queue config not found');
    }
    // $Flow
    return this.service.createDriver(_.defaults({}, config.queue, { key: this.key }));
  }

  /**
   * 获取Sled订阅驱动
   * @private
   * @param {string} channel 频道ID
   * @returns {Alaska$SubscribeDriver}
   */
  static createSubscribeDriver(channel: string): Alaska$SubscribeDriver {
    let config = this.config;
    if (!config.subscribe) {
      throw new ReferenceError('sled subscribe config not found');
    }
    // $Flow
    return this.service.createDriver(_.defaults({ channel }, config.subscribe));
  }

  /**
   * alias for sled.run()
   * @param {Object} [params]
   * @returns {Promise<any>}
   */
  static run(params): Promise<any> {
    let sled = new this(params);
    return sled.run();
  }

  /**
   * 将Sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  async send(timeout?: number, notify?: boolean): Promise<Alaska$sledQueueItem> {
    if (this.result || this.error) {
      throw new Error('can not send a finished sled');
    }
    //如果已经有item属性,代表已经发送到队列,或者是从队列中读取的sled
    if (this.item) {
      return this.item;
    }
    //默认60天超时
    timeout = timeout || 60 * 86400;

    let params = this.params;
    if (this.toJSON) {
      params = this.toJSON();
    }

    let key = this.key;
    let id = this.id;
    if (!id) {
      id = this.id = 'sled.' + key + '.' + random(10);
    }
    let item = {
      id,
      key,
      notify: notify || false,
      params,
      name: this.name,
      result: undefined,
      error: undefined,
      timeout: timeout || 0,
      createdAt: new Date(),
      expiredAt: new Date(Date.now() + (timeout * 1000))
    };

    let queue = this.createQueueDriver();
    await queue.push(item);
    queue.free();
    return item;
  }

  /**
   * 从队列中读取一个sled
   * @param {number} [timeout] 读取超时,单位毫秒,默认Infinity
   */
  static async read(timeout?: number): Promise<Alaska$Sled|null> {
    let queue = this.createQueueDriver();
    let item: Alaska$sledQueueItem = await queue.pop(timeout);
    queue.free();
    if (!item) {
      return null;
    }
    let sled = new this();
    if (sled.fromJSON) {
      sled.fromJSON(item.params);
    } else {
      sled.params = item.params;
    }
    if (item.result !== undefined) {
      sled.result = item.result;
    } else if (item.error) {
      sled.error = new Error(item.error);
    }
    sled.fromQueue = true;
    sled.item = item;
    sled.id = item.id;
    // $Flow
    return sled;
  }

  /**
   * 等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位秒,默认为60天
   */
  async wait(waitTimeout?: number, sledTimeout?: number): Promise<any> {
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

    if (!this.item) {
      //异步将sled插入队列
      this.send(sledTimeout, true);
    }

    let subscribe = this.createSubscribeDriver(id);
    let msg = await subscribe.once(waitTimeout);
    subscribe.free();
    if (!msg) {
      return null;
    }
    if (msg.result !== undefined) {
      this.result = msg.result;
    } else if (msg.error) {
      this.error = new Error(msg.error);
      throw this.error;
    }
    return this.result;
  }

  /**
   * 执行sled
   * @returns {*}
   */
  async run(): Promise<any> {
    if (this.error) {
      throw this.error;
    }
    if (this.result !== undefined) {
      return this.result;
    }
    if (this.validate) {
      let promise = this.validate(this.params);
      if (promise && promise.then) {
        await promise;
      }
    }
    if (this.constructor._pre) {
      await collie.compose(this.constructor._pre, [], this);
    }

    let result = this.result;
    //如果已经有result,说明在前置hooks中已经执行完成任务

    try {
      result = this.exec(this.params);
      if (result && result.then) {
        result = await result;
      }
    } catch (error) {
      this.error = error;
      if (this.item && this.item.notify) {
        // 发送通知
        let subscribe = this.createSubscribeDriver(this.item.id);
        await subscribe.publish({ error: error.message });
        subscribe.free();
      }
      throw error;
    }
    this.result = result;

    if (this.constructor._post) {
      await collie.compose(this.constructor._post, [result], this);
    }

    if (this.item && this.item.notify) {
      // 发送通知
      let subscribe = this.createSubscribeDriver(this.item.id);
      await subscribe.publish({ result });
      subscribe.free();
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
