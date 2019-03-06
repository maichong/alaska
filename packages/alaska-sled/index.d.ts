import { MainService, Service, Extension, ObjectMap } from 'alaska';
import QueueDriver, { QueueDriverOptions } from 'alaska-queue';
import SubscribeDriver, { SubscribeDriverOptions } from 'alaska-subscribe';
import LockDriver, { LockDriverOptions } from 'alaska-lock';
import * as mongodb from 'mongodb';

declare module 'alaska' {
  export interface Service {
    sleds: ObjectMap<any>;
  }

  export interface ConfigData {
    'alaska-sled'?: {
      [id: string]: SledConfig;
    };
  }
}

declare module 'alaska-modules' {
  export interface ServiceMetadata {
    sleds?: ObjectMap<string>;
  }
  export interface PluginMetadata {
    sleds?: ObjectMap<string>;
  }

  export interface ServiceModules {
    sleds: ObjectMap<typeof Sled>;
  }

  export interface PluginModules {
    sleds: ObjectMap<typeof Sled | SledSettings | SledGenerator>;
  }
}

export interface SledGenerator {
  (sled: typeof Sled): typeof Sled;
}

export interface SledSettings {
  pre?: SledHook;
  post?: SledHook;
}

export interface SledHook {
  (...args: any[]): any;
  _id?: string;
  _before?: string;
  _after?: string;
}

export interface SledConfig {
  queue?: QueueDriverOptions;
  subscribe?: SubscribeDriverOptions;
  lock?: LockDriverOptions;
}

export interface SledTask<T, R> {
  id: string;
  /**
   * Sled id
   */
  sled: string;
  sledName: string;
  notify: boolean;
  params: T;
  result?: R;
  error?: string;
  timeout: number;
  createdAt: Date;
  expiredAt: Date;
}

export interface SledMessage<R> {
  id: string;
  result?: R;
  error?: string;
}

export interface SledOptions {
  /**
   * 是否上锁，true 为上锁，false 为不上锁，默认根据Sled是否设置了lock驱动
   */
  lock?: boolean;
  /**
   * MongoDB Session
   */
  dbSession?: null | mongodb.ClientSession;
}

export const BEFORE: (serviceId: string, hook: SledHook) => void;
export const AFTER: (serviceId: string, hook: SledHook) => void;

export class Sled<T, R> {
  static readonly classOfSled: true;
  static sledName: string;
  static id: string;
  static config: SledConfig;
  static main: MainService;
  static service: Service;
  static _getConfig(): SledConfig;
  /**
   * 查找模型类
   * @param {string} ref sledName or id
   */
  static lookup(ref: string): typeof Sled | null;
  /**
   * 执行Sled
   * @param {any} params
   * @param {SledOptions} [options]
   * @returns {any}
   */
  static run<T, R>(this: { new(params: T): Sled<T, R> }, params?: T, options?: SledOptions): Promise<R>;
  /**
   * 执行时使用MongoDB事务，如果执行失败自动回滚
   * @param {any} params
   * @returns {any}
   */
  static runWithTransaction<T, R>(this: { new(params: T): Sled<T, R> }, params?: T): Promise<R>;
  static pre(fn: SledHook): void;
  static post(fn: SledHook): void;
  /**
   * 从队列中读取一个Sled任务
   * @param {number} [timeout] 读取超时,单位毫秒,默认Infinity
   */
  static read<S extends Sled<any, any>>(this: { new(): S }, timeout?: number): Promise<S | null>;
  static createQueueDriver<T, R>(): QueueDriver<SledTask<T, R>>;
  static createSubscribeDriver<T>(): SubscribeDriver<SledMessage<T>>;
  static createLockDriver<T>(): LockDriver;

  readonly instanceOfSled: true;
  readonly sledName: string;
  readonly id: string;
  readonly service: Service;
  readonly config: SledConfig;
  dbSession: null | mongodb.ClientSession;
  fromQueue?: boolean;
  fromJSON?: Function;
  toJSON?: Function;

  /**
   * 队列任务，只有从队列中读取的Sled或将Sled发送到队列后才有此属性
   */
  task?: SledTask<T, R>;

  params: T;
  /**
   * 执行结果
   */
  result?: R;

  /**
   * 执行错误
   */
  error?: Error;

  constructor(params?: T);

  /**
   * 执行sled
   * @param {SledOptions} [options]
   * @returns {any}
   */
  run(options?: SledOptions): Promise<R>;
  /**
   * 执行时使用MongoDB事务，如果执行失败自动回滚
   * @returns {any}
   */
  runWithTransaction(): Promise<R>;


  /**
   * 将Sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位毫秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  send(timeout?: number, notify?: boolean): Promise<SledTask<T, R>>;
  send(notify?: boolean): Promise<SledTask<T, R>>;

  /**
   * 等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位毫秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位毫秒,默认为60天
   */
  wait(waitTimeout?: number, sledTimeout?: number): Promise<null | R>

  exec(params: T): Promise<R> | R;
}

export default class SledExtension extends Extension {
}
