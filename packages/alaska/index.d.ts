import { ModulesMetadata, Modules } from 'alaska-modules';
import { IDebugger } from 'debug';
import { Context as KoaContext } from 'koa';

export interface ServiceConfig {
  dir?: string;
  optional?: boolean;
}

export interface ExtensionConfig {
}

export interface PluginConfig {
  dir?: string;
  [key: string]: any;
}

export interface ConfigData {
  // App 级别
  env?: string;
  libraries?: string[];
  extensions?: {
    [id: string]: ExtensionConfig;
  };
  // Service 级别

  /**
   * routes 路由前缀，默认为 /
   * 如果为 false，则代表该Service不开放routes路由
   */
  prefix?: string | boolean;
  /**
   * api 路由前缀，默认为 /api
   * 如果为 false，则代表该Service不开放API
   */
  apiPrefix?: string | boolean;

  plugins?: {
    [id: string]: PluginConfig;
  };
  /**
   * 子 Service 列表
   * id -> ServiceConfig
   */
  services?: ObjectMap<ServiceConfig>;
}

export class Config {
  static readonly classOfConfig: true;
  static readonly defaultConfig: ConfigData;
  static applyData(data: ConfigData, config: any): ConfigData;

  readonly instanceOfConfig: true;
  readonly service: Service;
  readonly values: ConfigData;

  get(key: string, defaultValue?: any, mainAsDefault?: boolean): any;
  apply(config: any): void;
}

declare interface ServiceOptions {
  id: string;
  configFileName?: string;
}

export class Service {
  static readonly classOfService: true;
  readonly instanceOfService: true;
  readonly id: string;
  readonly configFileName: string;
  readonly config: Config;
  readonly debug: IDebugger;
  readonly main: MainService;
  static resolveMain(): Promise<MainService>;
  static lookup(id: string): Service | null;

  /**
   * Plugin map
   * key -> Plugin
   */
  plugins: Map<string, Plugin>;
  /**
   * Service map
   * id -> Service
   */
  services: Map<string, Service>;

  constructor(options: ServiceOptions);
  /**
   * 增加前置钩子
   */
  pre: (event: keyof this, fn: Function) => void;
  /**
   * 增加后置钩子
   */
  post: (event: keyof this, fn: Function) => void;
  /**
   * 判断是否是主Service
   */
  isMain(): boolean;
  lookup(id: string): Service | null;
  /**
   * 创建一个驱动对象
   */
  createDriver(options: DriverOptions): Driver<any, any>;
  /**
   * 获取配置，并确保配置信息已经完成初始化
   * @returns {Promise<Config>}
   */
  resolveConfig(): Promise<Config>;
  /**
   * 启动程序
   * @param modules modules对象，或返回modules的Promise
   */
  launch(modules: Modules | Promise<Modules>): Promise<void>;
  /**
   * 初始化阶段
   */
  init(): Promise<void>;
  initPlugins(): Promise<void>;
  /**
   * 启动阶段
   */
  start(): Promise<void>;
  /**
   * 就绪
   */
  ready(): Promise<void>;
  /**
   * 抛出普通错误
   */
  error(message: string, code?: number): never;
  error(code: number): never;
}

/**
 * 虚拟的MainService类型，事实上并不存在MainService类
 * 某些Extension在扩展Service方法时，只会扩展主Service
 * 所以该interface用来防止类型定义混乱
 * 例如 alaska-http 扩展的 listen() 方法，定义在MainService上而非所有Service上
 */
export interface MainService extends Service {
  readonly modules?: Modules;
  /**
   * Extension map
   * id -> Extension
   */
  extensions: Map<string, Extension>;
  /**
   * 所有Service，services属性只包含当前的直接Service
   */
  allServices: Map<string, Service>;
}

export class Plugin<T extends PluginConfig = any>{
  static readonly classOfPlugin: true;
  readonly instanceOfPlugin: true;
  service: Service;
  config: T;

  constructor(config: T, service: Service);
}

export class Extension {
  static readonly after: string[];
  static readonly classOfExtension: true;
  readonly instanceOfExtension: true;
  readonly main: MainService;

  constructor(main: MainService);
}

declare class Loader {
  static readonly classOfLoader: true;
  readonly instanceOfLoader: true;
  metadata: ModulesMetadata;
  extConfig: ExtensionConfig;

  constructor(metadata: ModulesMetadata, extConfig: ExtensionConfig);
}

export interface DriverOptions {
  /**
   * 驱动库名称
   */
  type: string;
  /**
   * 可循环使用，默认为单次使用的驱动
   */
  recycled?: boolean;
}

export class Driver<O extends DriverOptions, D> {
  static readonly classOfDriver: true;
  readonly instanceOfDriver: true;
  type: string;
  service: Service;
  options: O;
  recycled: boolean;
  idle: null | Date;
  protected _driver: D;

  constructor(options: O, service: Service);

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver(): D;

  /**
   * 释放驱动，驱动转入空闲
   */
  free(): void;

  /**
   * 销毁驱动
   */
  destroy(): void;
}

// eslint-disable-next-line space-infix-ops
export type Omit<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

export interface ObjectMap<T> {
  [key: string]: T;
}

/**
 * 接口关闭
 */
export const CLOSED = 0;

/**
 * 公开接口
 */
export const PUBLIC = 1;

/**
 * 接口需要登录
 */
export const AUTHENTICATED = 2;

/**
 * 一般错误
 */
export class NormalError extends Error {
  code: number | void;
  status: number | void;
  constructor(message: string, code?: number);
}
