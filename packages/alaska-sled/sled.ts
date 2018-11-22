import * as _ from 'lodash';
import * as collie from 'collie';
import { MainService, Service } from 'alaska';
import QueueDriver from 'alaska-queue';
import SubscribeDriver from 'alaska-subscribe';
import { SledConfig, SledTask, SledMessage } from '.';

export default class Sled<T, R> {
  static classOfSled: true = true;
  static sledName: string;
  static id: string;
  static main: MainService;
  static service: Service;
  static _pre?: Function[];
  static _post?: Function[];
  static _config?: SledConfig;

  readonly instanceOfSled: true;
  params: T;
  task?: SledTask<T, R>;
  result?: R;
  error?: Error;
  fromQueue?: boolean;
  fromJSON?: Function;
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
    // 执行结果
    // this.result = undefined;
    // 错误
    // this.error = undefined;
  }

  /**
   * 查找模型类
   * @param {string} ref modelName or id
   */
  static lookup(ref: string): typeof Sled | null {
    let service: Service = this.service || this.main;
    if (ref.indexOf('.') > -1) {
      let [serviceId, sledName] = ref.split('.');
      ref = sledName;
      let serviceModule = this.main.modules.services[serviceId];
      if (!serviceModule) return null;
      service = serviceModule.service;
    }
    return service.sleds[ref] || null;
  }

  static run<T, R>(this: { new(params: T): Sled<T, R> }, params?: T): Promise<R> {
    let sled = new this(params);
    return sled.run();
  }

  /**
   * 获取Sled设置
   * @private
   * @returns {Object}
   */
  static get config(): SledConfig {
    if (!this._config) {
      let { service, id } = this;
      let name = `sled.${id}`;
      let config = service.config.get(name, null, true);
      if (!config) {
        config = service.config.get('sled', null, true);
      }
      this._config = config;
    }
    if (!this._config) {
      throw new ReferenceError('sled config not found');
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

  static async read<S extends Sled<any, any>>(this: { new(): S }, timeout?: number): Promise<S | null> {
    let queue = (this.constructor as typeof Sled).createQueueDriver();
    let task: SledTask<any, any> = await queue.pop(timeout);
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
    // $Flow
    return sled;
  }

  /**
   * 获取Sled队列驱动
   * @private
   * @returns {alaska$QueueDriver}
   */
  static createQueueDriver<T, R>(): QueueDriver<SledTask<T, R>, any, any> {
    let { config, id } = this;
    if (!config.queue) {
      throw new ReferenceError('sled queue config not found');
    }
    // @ts-ignore
    return this.service.createDriver(_.assign({ key: 'queue:' + id }, config.queue));
  }

  /**
   * 获取Sled订阅驱动
   * @private
   * @param {string} channel 频道ID
   * @returns {alaska$SubscribeDriver}
   */
  static createSubscribeDriver<R>(): SubscribeDriver<SledMessage<R>, any, any> {
    let { config, id } = this;
    if (!config.subscribe) {
      throw new ReferenceError('sled subscribe config not found');
    }
    // @ts-ignore
    return this.service.createDriver(_.defaults({ channel: 'subscribe:' + id }, config.subscribe));
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
   * @returns {any}
   */
  async run(): Promise<R> {
    if (this.error) {
      throw this.error;
    }
    if (typeof this.result !== 'undefined') {
      return this.result;
    }

    if ((this.constructor as typeof Sled)._pre) {
      await collie.compose((this.constructor as typeof Sled)._pre, [], this);
    }

    // 如果已经有result,说明在前置hooks中已经执行完成任务
    if (typeof this.result !== 'undefined') {
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
    return result;
  }
}
