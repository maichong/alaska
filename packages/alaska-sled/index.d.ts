import { MainService, Service, Extension, ObjectMap } from 'alaska';
import QueueDriver, { QueueDriverOptions } from 'alaska-queue';
import SubscribeDriver, { SubscribeDriverOptions } from 'alaska-subscribe';

declare module 'alaska' {
  export interface Service {
    sleds: ObjectMap<typeof Sled>;
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
  pre?: Function;
  post?: Function;
}

export interface SledConfig {
  queue?: QueueDriverOptions;
  subscribe?: SubscribeDriverOptions;
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
  error?: Error;
}

export class Sled<T, R> {
  static readonly classOfSled: true;
  static sledName: string;
  static id: string;
  static config: SledConfig;
  static main: MainService;
  static service: Service;
  static lookup(ref: string): typeof Sled | null;
  static run<T, R>(this: { new(params: T): Sled<T, R> }, params?: T): Promise<R>;
  static pre(fn: Function): void;
  static post(fn: Function): void;
  static read<S extends Sled<any, any>>(this: { new(): S }, timeout?: number): Promise<S | null>;
  static createQueueDriver<T, R>(): QueueDriver<SledTask<T, R>, any, any>;
  static createSubscribeDriver<T>(): SubscribeDriver<SledMessage<T>, any, any>;

  readonly instanceOfSled: true;
  readonly sledName: string;
  readonly id: string;
  readonly service: Service;
  readonly config: SledConfig;
  fromQueue?: boolean;
  fromJSON?: Function;

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
   * @returns {any}
   */
  run(): Promise<R>;

  /**
   * 将Sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  // send(timeout?: number, notify?: boolean): Promise<void>;

  /**
   * 等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位秒,默认为60天
   */
  // wait(waitTimeout?: number, sledTimeout?: number): Promise<any>;

  exec(params: T): Promise<R> | R;
}

export default class SledExtension extends Extension {
}
