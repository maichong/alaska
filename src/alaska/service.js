// @flow

/* eslint global-require:0 */

import type Koa from 'koa';
import _ from 'lodash';
import Debugger from 'debug';
import Router from 'koa-router';
import collie from 'collie';
import IntlMessageFormat from 'intl-messageformat';
import jsonMerge from 'json-merge-patch';
import mongoose from 'mongoose';
import depd from 'depd';
import alaska, { PanicError } from './alaska';
import * as utils from './utils';
import defaultConfig from './config';

const deprecate = depd('alaska.service');

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以依赖其他Service
 * 一个Service实例可以同时被多个Service依赖
 */
export default class Service {
  static classOfService = true;

  alaska: Alaska$Alaska;
  debug: Debugger;
  options: Alaska$Service$options;
  _router: Router;
  _cache: Alaska$CacheDriver;
  _renderer: Alaska$Renderer;

  _controllers = {};
  _apiControllers = {};
  _messageCache: {
    [locale: string]: {
      [message: string]: IntlMessageFormat
    }
  };

  _cacheDrivers: { [id: string]: Alaska$CacheDriver };

  _idleDrivers: { [idleId: string]: Alaska$Driver[] };
  _freeIdleTimer = 0;
  /**
   * 所依赖的子Service实例对象别名映射表
   * @type {Object}
   */
  services: { [id: string]: Alaska$Service };
  /**
   * 本Service Sled列表
   * @type {Object}
   */
  sleds: { [sledName: string]: Class<Alaska$Sled> };
  /**
   * 本Service Plugin列表
   * @type {Object}
   */
  plugins: { [key: string]: Plugin };
  /**
   * 本Service数据模型列表
   * @type {Object}
   */
  models: { [modelName: string]: Class<Alaska$Model> };
  /**
   * 本Service本地化配置
   * @type {Object}
   */
  locales: { [locale: string]: Object };
  /**
   * 数据库连接实例
   * @type {mongoose.Connection}
   * @private
   */
  _db: Mongoose$Connection;
  /**
   * 本Service的配置项
   * @type {Object}
   * @private
   */
  _config = {};
  /**
   * 本Service的所有模板目录
   * @type {[string]}
   * @private
   */
  templatesDirs: string[];
  version = '';

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   */
  constructor(options: Alaska$Service$options) {
    this.options = options;
    this.services = {};
    this.sleds = {};
    this.plugins = {};
    this.models = {};
    this.locales = {};
    this.templatesDirs = [];
    this._messageCache = {};
    this._cacheDrivers = {};
    this._idleDrivers = {};

    if (!options.id) {
      throw new Error('Service id is not specified.');
    }

    if (!options.dir) {
      throw new Error('Service dir is not specified.');
    }

    if (!options.configFile) {
      //Service默认配置文件
      options.configFile = options.id + '.js';
    }
    // $Flow
    this.alaska = alaska;
    /* eslint new-cap:0 */
    this.debug = Debugger(options.id);
    this.panic = alaska.panic;
    this.error = alaska.error;
    this.debug('constructor');

    collie(this, 'init', require('./service/init').default);
    collie(this, 'loadConfig', require('./service/loadConfig').default);
    collie(this, 'loadPlugins', require('./service/loadPlugins').default);
    collie(this, 'loadLocales', require('./service/loadLocales').default);
    collie(this, 'loadModels', require('./service/loadModels').default);
    collie(this, 'loadSleds', require('./service/loadSleds').default);
    collie(this, 'loadRoutes', require('./service/loadRoutes').default);
    collie(this, 'loadApi', require('./service/loadApi').default);
    collie(this, 'loadControllers', require('./service/loadControllers').default);
    collie(this, 'loadStatics', require('./service/loadStatics').default);
    collie(this, 'mount', require('./service/mount').default);
    collie(this, 'launch');
    collie(this, 'registerModel');

    this._config = _.defaultsDeep({}, defaultConfig);

    // $Flow
    alaska.registerService(this);
  }

  /**
   * Service id
   * @returns {string}
   */
  get id(): string {
    return this.options.id;
  }

  /**
   * Service 目录
   * @returns {string}
   */
  get dir(): string {
    return this.options.dir;
  }

  get configFile(): string {
    // $Flow
    return this.options.configFile;
  }

  /**
   * 获取koa app实例
   * @returns {Koa}
   */
  get app(): Koa {
    return this.alaska.app;
  }

  /**
   * 获取主Service实例
   * @returns {Service}
   */
  get main(): Alaska$Service {
    return this.alaska.main;
  }

  /**
   * 获取Service实例路由器
   * @returns {Router}
   */
  get router(): Router {
    if (!this._router) {
      this._router = new Router({
        prefix: this.getConfig('prefix'),
        methods: this.getConfig('methods', ['GET', 'POST'])
      });
    }
    return this._router;
  }

  /**
   * 获取子Service列表数组
   * @returns {[Service]}
   */
  get serviceList(): Alaska$Service[] {
    return _.values(this.services);
  }

  /**
   * 获取Model列表数组
   * @returns {[Model]}
   */
  get modelList(): Class<Alaska$Model>[] {
    return _.values(this.models);
  }

  /**
   * 获取Sled列表数组
   * @returns {[Sled]}
   */
  get sledList(): Alaska$Sled[] {
    return _.values(this.sleds);
  }

  /**
   * 获取当前Service的数据链接
   * 如果本Service不是主Service且没有配置数据链接,则返回主配置链接
   * 如果返回false,代表本Service不需要数据库支持
   * @returns {mongoose.Connection | Boolean}
   */
  get db(): Mongoose$Connection | boolean {
    if (this._db) {
      return this._db;
    }
    let config = this.getConfig('db');
    if (config === false) {
      return false;
    }
    if (!config) {
      if (this.isMain()) {
        console.warn('No database config');
      } else {
        this._db = this.alaska.db;
        return this._db;
      }
    }
    // $Flow
    this._db = mongoose.createConnection(config);
    this._db.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });
    return this._db;
  }

  /**
   * 获取默认缓存驱动
   * @returns {LruCacheDriver|*}
   */
  get cache(): Alaska$CacheDriver {
    if (!this._cache) {
      // $Flow
      this._cache = (this.createDriver(this.getConfig('cache')): Alaska$CacheDriver);
    }
    return this._cache;
  }

  /**
   * 获取模板引擎
   * @returns {*}
   */
  get renderer(): Alaska$Renderer {
    if (!this._renderer) {
      let config = this.getConfig('renderer');
      if (typeof config === 'string') {
        config = { type: config };
      }
      let Renderer = alaska.modules.renderers[config.type];
      if (!Renderer) {
        this.panic(`Renderer '${config.type}' not found`);
      }
      this._renderer = new Renderer(this, config);
    }
    return this._renderer;
  }

  /**
   * 判断当前Service是否是主Service
   * @returns Boolean
   */
  isMain() {
    return alaska.main === this;
  }

  /**
   * 追加配置项
   * @param {Object} config
   */
  applyConfig(config: Alaska$Config): void {
    jsonMerge.apply(this._config, config);
  }

  /**
   * 获取当前Service配置
   * @deprecated
   * @param {string} key 配置名
   * @param {*} [defaultValue] 默认值
   * @param {boolean} [mainAsDefault] 如果当前Service中不存在配置,则获取主Service的配置
   */
  config(key: string, defaultValue?: any, mainAsDefault?: boolean): any {
    deprecate('config()');
    return this.getConfig(key, defaultValue, mainAsDefault);
  }

  /**
   * 获取当前Service配置
   * @since 0.12.0
   * @param {string} key 配置名
   * @param {*} [defaultValue] 默认值
   * @param {boolean} [mainAsDefault] 如果当前Service中不存在配置,则获取主Service的配置
   */
  getConfig(key: string, defaultValue?: any, mainAsDefault?: boolean): any {
    let value = _.get(this._config, key, defaultValue);
    if (!mainAsDefault || value !== undefined || this.isMain()) {
      return value;
    }
    return alaska.getConfig(key);
  }

  /**
   * 启动Service
   * @method launch
   */
  async launch(modules: Object) {
    this.debug('launch');
    // $Flow
    this.launch = utils.resolved;
    alaska.modules = modules;
    await this.init();
    await this.loadConfig();
    await this.loadPlugins();
    await this.loadLocales();
    await this.loadModels();
    await this.loadSleds();
    await this.loadRoutes();
    await this.loadApi();
    await this.loadControllers();
    await this.loadStatics();
    await this.mount();
    await alaska.loadMiddlewares();
    await alaska.listen();
  }

  /**
   * 通用创建驱动方法
   * @param {Object} options
   * @returns {Driver}
   */
  createDriver(options: Object): Alaska$Driver {
    let idleId = '';
    if (options.idle) {
      //允许空闲
      idleId = JSON.stringify(options);
      //当前有空闲驱动
      if (this._idleDrivers[idleId] && this._idleDrivers[idleId].length) {
        let d = this._idleDrivers[idleId].shift();
        d.idle = 0;
        return d;
      }
    }

    //当前无空闲驱动,创建新驱动
    const Driver = alaska.modules.drivers[options.type];
    if (!Driver) throw new PanicError(`Driver '${options.type}' not found!`);
    let driver = new Driver(this, options);
    driver.idleId = idleId;
    driver.idle = 0;
    return driver;
  }

  /**
   * 释放驱动
   * @param {Driver|*} driver
   */
  freeDriver(driver: Alaska$Driver) {
    // 已经空闲
    if (driver.idle) return;
    if (driver.idleId) {
      //允许空闲
      let { idleId } = driver;
      if (!this._idleDrivers[idleId]) {
        this._idleDrivers[idleId] = [];
      }
      if (this._idleDrivers[idleId].length > driver.options.idle) {
        this._idleDrivers[idleId].shift().destroy();
      }
      if (driver.onFree) {
        driver.onFree();
      }
      driver.idle = Date.now();
      this._idleDrivers[idleId].push(driver);
      if (!this._freeIdleTimer) {
        this._freeIdleTimer = setInterval(() => this._destroyIdleDrivers(), 60 * 1000);
      }
      return;
    }
    driver.destroy();
  }

  /**
   * 销毁过期空闲驱动
   * @private
   */
  _destroyIdleDrivers() {
    Object.keys(this._idleDrivers).forEach((idleId) => {
      let drivers = this._idleDrivers[idleId];
      for (let d of drivers) {
        if (d.idle && Date.now() - d.idle > 5 * 60 * 1000) {
          _.pull(drivers, d);
          d.destroy();
        }
      }
    });
  }

  /**
   * 注册模型
   * @param {string} modelName
   * @param {Model} Model
   * @returns {Model}
   */
  async registerModel(modelName: string, Model: Class<Alaska$Model>): Promise<Class<Alaska$Model>> {
    await Model.register(modelName);
    return Model;
  }

  /**
   * 获取指定Model
   * @deprecated
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {Model|null}
   */
  model(modelName: string): Class<Alaska$Model> {
    deprecate('model()');
    return this.getModel(modelName);
  }

  /**
   * 获取指定Model
   * @since 0.12.0
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {Model}
   */
  getModel(modelName: string): Class<Alaska$Model> {
    if (_.isObject(this.models[modelName])) {
      return this.models[modelName];
    }

    let index = modelName.indexOf('.');
    if (index > -1) {
      let serviceId = modelName.substr(0, index);
      modelName = modelName.substr(index + 1);
      return alaska.getService(serviceId).getModel(modelName);
    }
    throw new PanicError(`"${modelName}" model not found`);
  }

  /**
   * 判断是否存在指定Model
   * @since 0.12.0
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {boolean}
   */
  hasModel(modelName: string): boolean {
    if (_.isObject(this.models[modelName])) {
      return true;
    }
    let index = modelName.indexOf('.');
    if (index > -1) {
      let serviceId = modelName.substr(0, index);
      if (!alaska.hasService(serviceId)) return false;
      modelName = modelName.substr(index + 1);
      return alaska.getService(serviceId).hasModel(modelName);
    }
    return false;
  }

  /**
   * 获取指定Sled
   * @deprecated
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {Sled}
   */
  sled(sledName: string): Class<Alaska$Sled> {
    deprecate('sled()');
    return this.getSled(sledName);
  }

  /**
   * 获取指定Sled
   * @since 0.12.0
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {Sled}
   */
  getSled(sledName: string): Class<Alaska$Sled> {
    if (this.sleds[sledName]) {
      return this.sleds[sledName];
    }
    let index = sledName.indexOf('.');
    if (index > -1) {
      let serviceId = sledName.substr(0, index);
      if (alaska.hasService(serviceId)) {
        sledName = sledName.substr(index + 1);
        return alaska.getService(serviceId).getSled(sledName);
      }
    }
    throw new PanicError(`"${sledName}" sled not found`);
  }

  /**
   * 判断指定Sled是否存在
   * @since 0.12.0
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {boolean}
   */
  hasSled(sledName: string): boolean {
    if (_.isObject(this.sleds[sledName])) {
      return true;
    }
    let index = sledName.indexOf('.');
    if (index > -1) {
      let serviceId = sledName.substr(0, index);
      if (!alaska.hasService(serviceId)) return false;
      sledName = sledName.substr(index + 1);
      return alaska.getService(serviceId).hasSled(sledName);
    }
    return false;
  }

  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName: string, data?: Object): Promise<any> {
    try {
      let SledClass = this.getSled(sledName);
      let sled = new SledClass(data);
      return sled.run();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 翻译消息
   * @param {string} message
   * @param {string} [locale]
   * @param {Object} [values]
   * @param {Object} [formats]
   * @returns {string}
   */
  t(message: string, locale?: string, values?: Object, formats?: Object): string {
    if (!locale) {
      locale = this.getConfig('defaultLocale');
    }
    let messages = this.locales[locale];
    if (!messages) {
      messages = alaska.locales[locale];
      if (!messages) return message;
    }
    let template = messages[message];
    if (!template) {
      if (alaska.locales[locale]) template = alaska.locales[locale][message];
      if (!template) return message;
    }
    if (!values) {
      return template;
    }
    if (!this._messageCache[locale]) {
      this._messageCache[locale] = {};
    }
    if (!this._messageCache[locale][message]) {
      this._messageCache[locale][message] = new IntlMessageFormat(template, locale, formats);
    }
    return this._messageCache[locale][message].format(values);
  }

  /**
   * 输出Service实例JSON调试信息
   * @returns {Object}
   */
  toJSON() {
    let res = {
      id: this.id,
      version: this.version,
      options: this.options,
      config: this._config,
      api: {},
      controllers: {},
      models: {},
      services: Object.keys(this.services)
    };
    Object.keys(this._apiControllers).forEach((key) => {
      let c = this._apiControllers[key];
      res.api[key] = Object.keys(c).filter((name) => name[0] !== '_');
    });
    Object.keys(this._controllers).forEach((key) => {
      let c = this._controllers[key];
      res.controllers[key] = Object.keys(c).filter((name) => name[0] !== '_');
    });
    for (let m of this.modelList) {
      res.models[m.modelName] = {
        api: m.api
      };
    }
    return res;
  }

  /**
   * 抛出严重错误,并输出调用栈
   * @method panic
   * @param {string|Error} message
   * @param {string|number} [code]
   */
  panic: (message: string | number, code?: number) => void;

  /**
   * 抛出普通异常
   * @method error
   * @param {string|Error} message
   * @param {string|number} [code]
   */
  error: (message: string | number, code?: number) => void;

  /**
   * 执行一个异步任务,如果失败则抛出NormalError
   * @method try
   * @param {Promise} promise
   * @returns {Promise<T>}
   */
  try: <T>(promise: Promise<T>) => Promise<T>;

  /**
   * 初始化
   * @method init
   */
  init: () => Promise<void>;

  /**
   * 加载配置
   * @method loadConfig
   */
  loadConfig: () => Promise<void>;

  /**
   * 加载多语言
   * @method loadLocales
   */
  loadLocales: () => Promise<void>;

  /**
   * 加载插件
   * @method loadPlugins
   */
  loadPlugins: () => Promise<void>;

  /**
   * 加载数据模型
   * @method loadModels
   */
  loadModels: () => Promise<void>;

  /**
   * 加载Sled列表
   * @method loadSleds
   */
  loadSleds: () => Promise<void>;

  /**
   * 载入Service中间件
   * @method loadRoutes
   */
  loadRoutes: () => Promise<void>;

  /**
   * 载入API接口控制器
   * @method loadApi
   */
  loadApi: () => Promise<void>;

  /**
   * 载入控制器
   * @method loadControllers
   */
  loadControllers: () => Promise<void>;

  /**
   * 加载资源服务
   * @method loadStatics
   */
  loadStatics: () => Promise<void>;

  /**
   * 挂载路由
   * @method mount
   */
  mount: () => Promise<void>;
}
