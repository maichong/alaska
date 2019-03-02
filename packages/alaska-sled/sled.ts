import * as _ from 'lodash';
import * as collie from 'collie';
import * as random from 'string-random';
import * as mongodb from 'mongodb';
import { MainService, Service } from 'alaska';
import QueueDriver from 'alaska-queue';
import SubscribeDriver from 'alaska-subscribe';
import LockDriver from 'alaska-lock';
import { SledConfig, SledTask, SledMessage, SledOptions } from '.';

export default class Sled<T, R> {
  static classOfSled: true = true;
  static sledName: string;
  static id: string;
  static main: MainService;
  static service: Service;
  static _pre?: Function[];
  static _post?: Function[];
  static _config?: null | SledConfig;

  readonly instanceOfSled: true;
  params: T;
  dbSession: null | mongodb.ClientSession;
  taskId?: string;
  task?: SledTask<T, R>;
  result?: R;
  error?: Error;
  fromQueue?: boolean;
  fromJSON?: Function;
  toJSON?: Function;
  exec: (params: T) => Promise<R> | R;

  /**
   * Sled构造函数
   * @param {Object} [params]
   */
  constructor(params?: T) {
    this.instanceOfSled = true;
    // @ts-ignore params 默认为 {}
    this.params = params || {};
    // 队列task数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.task = null;
    this.dbSession = null;
    // 执行结果
    // this.result = undefined;
    // 错误
    // this.error = undefined;
  }

  /**
   * 查找模型类
   * @param {string} ref sledName or id
   */
  static lookup(ref: string): typeof Sled | null {
    let service: Service = this.service || this.main;
    if (ref.indexOf('.') > -1) {
      let [serviceId, sledName] = ref.split('.');
      if (!serviceId) {
        // ref -> '.SledName'
        return this.main.sleds[sledName] || null;
      }
      ref = sledName;
      service = this.main.allServices.get(serviceId);
      if (!service) return null;
    }
    return service.sleds[ref] || null;
  }

  /**
   * 执行Sled
   * @param {any} params
   * @param {SledOptions} [options]
   * @returns {any}
   */
  static run<T, R>(this: { new(params: T): Sled<T, R> }, params?: T, options?: SledOptions): Promise<R> {
    let sled = new this(params);
    return sled.run(options);
  }

  /**
   * 执行时使用MongoDB事务，如果执行失败自动回滚
   * @param {any} params
   * @returns {any}
   */
  static runWithTransaction<T, R>(this: { new(params: T): Sled<T, R> }, params?: T): Promise<R> {
    let sled = new this(params);
    return sled.runWithTransaction();
  }

  /**
   * 获取Sled设置
   * @private
   * @returns {Object}
   */
  static get config(): SledConfig {
    let config = this._getConfig();
    if (!config) {
      throw new ReferenceError(`sled config not found [sled.${this.sledName}]`);
    }
    return config;
  }

  static _getConfig(): SledConfig {
    let { service, sledName } = this;
    if (typeof this._config === 'undefined') {
      this._config = service.config.get(`sled.${sledName}`, null);
    }
    return this._config;
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
   * 从队列中读取一个Sled任务
   * @param {number} [timeout] 读取超时,单位毫秒,默认Infinity
   */
  static async read(timeout?: number): Promise<Sled<any, any> | null> {
    let queue = (this as typeof Sled).createQueueDriver();
    let task: SledTask<any, any> = await queue.pop(timeout || 0);
    queue.free();
    if (!task) {
      return null;
    }
    let sled = new this();
    if (sled.fromJSON) {
      sled.fromJSON(task.params);
    } else {
      sled.params = task.params;
    }
    if (typeof task.result !== 'undefined') {
      sled.result = task.result;
    } else if (task.error) {
      sled.error = new Error(task.error);
    }
    sled.fromQueue = true;
    sled.task = task;
    return sled;
  }

  /**
   * 获取Sled队列驱动
   */
  static createQueueDriver<T, R>(): QueueDriver<SledTask<T, R>> {
    let { config, id, sledName } = this;
    if (!config.queue) {
      throw new ReferenceError(`sled queue config not found [sled.${sledName}.queue]`);
    }
    // @ts-ignore
    return this.service.createDriver(_.assign({ key: `queue:${id}` }, config.queue));
  }

  /**
   * 获取Sled订阅驱动
   */
  static createSubscribeDriver<R>(): SubscribeDriver<SledMessage<R>> {
    let { config, id, sledName } = this;
    if (!config.subscribe) {
      throw new ReferenceError(`sled subscribe config not found [sled.${sledName}.subscribe]`);
    }
    // @ts-ignore
    return this.service.createDriver(_.assign({ channel: `subscribe:${id}` }, config.subscribe));
  }

  /**
   * 创建Lock驱动
   */
  static createLockDriver(): LockDriver {
    let { config, id, sledName } = this;
    if (!config.lock) {
      throw new ReferenceError(`sled lock config not found [sled.${sledName}.lock]`);
    }
    // @ts-ignore
    return this.service.createDriver(_.assign({ resource: `lock:${id}` }, config.lock));
  }

  /**
   * 获取sled所属service
   * @returns {Service}
   */
  get service(): Service {
    return (this.constructor as typeof Sled).service;
  }

  /**
   * 获取Sled name
   * @returns {string}
   */
  get sledName(): string {
    return (this.constructor as typeof Sled).sledName || this.constructor.name;
  }

  /**
   * 获取Sled id
   * @returns {string}
   */
  get id(): string {
    return (this.constructor as typeof Sled).id;
  }

  /**
   * 获取sled配置
   * @private
   * @returns {SledConfig}
   */
  get config(): SledConfig {
    return (this.constructor as typeof Sled).config;
  }

  /**
   * 执行sled
   * @param {SledOptions} [options]
   * @returns {any}
   */
  async run(options?: SledOptions): Promise<R> {
    options = options || {};
    if (this.error) {
      throw this.error;
    }
    if (typeof this.result !== 'undefined') {
      return this.result;
    }

    let lock = options.lock;
    if (typeof lock === 'undefined') {
      let config = (this.constructor as typeof Sled)._getConfig();
      if (config && config.lock) {
        lock = true;
      }
    }

    let locker: LockDriver;
    if (lock) {
      // 上锁
      locker = (this.constructor as typeof Sled).createLockDriver();
      await locker.lock();
    }

    // MongoDB session
    if (typeof options.dbSession !== 'undefined') {
      this.dbSession = options.dbSession;
    }

    if ((this.constructor as typeof Sled)._pre) {
      await collie.compose((this.constructor as typeof Sled)._pre, [], this);
    }

    // 如果已经有result,说明在前置hooks中已经执行完成任务
    if (typeof this.result !== 'undefined') {
      if (locker) {
        await locker.unlock();
        locker.free();
      }
      return this.result;
    }

    let result: R;

    try {
      result = await this.exec(this.params);
    } catch (error) {
      this.error = error;
      if (this.task && this.task.notify) {
        // 发送通知
        let subscribe = (this.constructor as typeof Sled).createSubscribeDriver();
        await subscribe.publish({ id: this.task.id, error: error.message });
        subscribe.free();
      }
      if (locker) {
        await locker.unlock();
        locker.free();
      }
      throw error;
    }
    this.result = result;

    if ((this.constructor as typeof Sled)._post) {
      await collie.compose((this.constructor as typeof Sled)._post, [result], this);
    }

    if (this.task && this.task.notify) {
      // 发送通知
      let subscribe = (this.constructor as typeof Sled).createSubscribeDriver();
      await subscribe.publish({ id: this.task.id, result });
      subscribe.free();
    }
    if (locker) {
      await locker.unlock();
      locker.free();
    }
    return result;
  }

  /**
   * 执行时使用MongoDB事务，如果执行失败自动回滚
   * @returns {any}
   */
  async runWithTransaction(): Promise<R> {
    let dbSession = await this.service.db.startSession();
    await dbSession.startTransaction();
    try {
      let result = await this.run({ dbSession });
      await dbSession.commitTransaction();
      return result;
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    }
  }

  /**
   * 将Sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位毫秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  async send(timeout?: number, notify?: boolean): Promise<SledTask<T, R>> {
    if (typeof notify === 'undefined' && typeof timeout === 'boolean') {
      notify = timeout;
      timeout = 0;
    }
    if (this.result || this.error) {
      throw new Error('can not send a finished sled');
    }
    //如果已经有task属性,代表已经发送到队列,或者是从队列中读取的sled
    if (this.task) {
      return this.task;
    }
    //默认60天超时
    timeout = timeout || 60 * 86400 * 1000;

    let { params, id, taskId } = this;
    if (this.toJSON) {
      params = this.toJSON();
    }

    if (!taskId) {
      taskId = `sled.${id}.${random(10)}`;
      this.taskId = taskId;
    }
    let task: SledTask<T, R> = {
      id: taskId,
      sled: id,
      sledName: this.sledName,
      notify: notify || false,
      params,
      // eslint-disable-next-line no-undefined
      result: undefined,
      // eslint-disable-next-line no-undefined
      error: undefined,
      timeout: timeout || 0,
      createdAt: new Date(),
      expiredAt: new Date(Date.now() + (timeout * 1000))
    };

    let queue = (this.constructor as typeof Sled).createQueueDriver();
    await queue.push(task);
    queue.free();
    return task;
  }

  /**
   * 等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位毫秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位毫秒,默认为60天
   */
  async wait(waitTimeout?: number, sledTimeout?: number): Promise<null | R> {
    if (this.result) {
      return this.result;
    }
    if (this.error) {
      throw this.error;
    }

    if (!this.taskId) {
      this.taskId = `sled.${this.id}.${random(10)}`;
    }

    if (!this.task) {
      // 异步将sled插入队列
      this.send(sledTimeout, true);
    }

    let start = Date.now();
    let subscribe = (this.constructor as typeof Sled).createSubscribeDriver<R>();
    await subscribe.subscribe();
    while (true) {
      let timeout;
      if (waitTimeout) {
        timeout = waitTimeout - (Date.now() - start);
        if (timeout < 1) timeout = 1;
      }
      let msg = await subscribe.read(timeout);
      if (msg && msg.id !== this.taskId) continue; // 不是当前Sled
      await subscribe.cancel();
      subscribe.free();
      if (!msg) return null; // 超时
      if (typeof msg.result !== 'undefined') {
        this.result = msg.result;
      } else if (msg.error) {
        this.error = new Error(msg.error);
        throw this.error;
      }
      return this.result;
    }
  }
}
