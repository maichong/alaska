/**
 * @copyright Maichong Software Ltd. 2015 http://maichong.it
 * @date 2015-11-18
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import DEBUG from 'debug';
import Router from 'koa-router';
import collie from 'collie';
import IntlMessageFormat from 'intl-messageformat';
import alaska from './alaska';
import * as util from './util';
import defaultConfig from './config';

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以依赖其他Service
 * 一个Service实例可以同时被多个Service依赖
 */
export default class Service {
  /**
   * 路由器
   * @type {Router}
   * @private
   */
  _router = null;
  _controllers = {};
  _apiControllers = {};
  _locales = {};
  _messageCache = {};
  _cacheDrivers = {};
  _idleDrivers = {};
  _freeIdleTimer = 0;
  /**
   * 本ServiceSled列表
   * @type {Object}
   * @private
   */
  _sleds = {};
  /**
   * 本Service数据模型列表
   * @type {Object}
   * @private
   */
  _models = {};
  /**
   * 数据库连接实例
   * @type {mongoose.Connection}
   * @private
   */
  _db = null;
  /**
   * 本Service的配置项
   * @type {Object}
   * @private
   */
  _config = {};
  /**
   * 本Service的所有额外配置目录
   * @type {[string]}
   * @private
   */
  _configDirs = [];
  /**
   * 本Service的所有模板目录
   * @type {[string]}
   * @private
   */
  _templatesDirs = [];
  /**
   * 所依赖的子Service实例对象别名映射表
   * @type {Object}
   * @private
   */
  _services = {};
  util = util;

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   */
  constructor(options) {
    const service = this;
    this._options = options;

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
    this.alaska = alaska;
    this.debug = DEBUG(options.id);
    this.panic = alaska.panic;
    this.error = alaska.error;
    this.try = alaska.try;
    this.debug('constructor');

    collie(this, 'init', require('./service/init').default);
    collie(this, 'loadConfig', require('./service/loadConfig').default);
    collie(this, 'loadPlugins', require('./service/loadPlugins').default);
    collie(this, 'loadLocales', require('./service/loadLocales').default);
    collie(this, 'loadModels', require('./service/loadModels').default);
    collie(this, 'loadSleds', require('./service/loadSleds').default);
    collie(this, 'loadMiddlewares', require('./service/loadMiddlewares').default);
    collie(this, 'loadApi', require('./service/loadApi').default);
    collie(this, 'loadControllers', require('./service/loadControllers').default);
    collie(this, 'loadStatics', require('./service/loadStatics').default);
    collie(this, 'mount', require('./service/mount').default);
    collie(this, 'launch');
    collie(this, 'registerModel');

    this._config = _.defaultsDeep({}, defaultConfig);

    {
      //载入配置
      let configFilePath = this._options.dir + '/config/' + this._options.configFile;
      let config = util.include(configFilePath, true);
      if (config) {
        this.applyConfig(config);
      } else {
        console.warn('Missing config file %s', configFilePath);
      }
    }

    alaska.registerService(this);
  }

  /**
   * Service id
   * @returns {string}
   */
  get id() {
    return this._options.id;
  }

  /**
   * Service 目录
   * @returns {string}
   */
  get dir() {
    return this._options.dir;
  }

  /**
   * 获取语言配置列表
   * @returns {Object}
   */
  get locales() {
    return this._locales;
  }

  /**
   * 为Service增加配置目录,Service启动后再调用此方法将无效果
   * @param {string} dir
   */
  addConfigDir(dir) {
    this._configDirs.push(dir);
    if (util.isDirectory(dir + '/templates')) {
      this._templatesDirs.unshift(dir + '/templates');
    }
  }

  /**
   * 追加配置项
   * @param {Object} config
   */
  applyConfig(config) {
    for (let key in config) {
      if (!config.hasOwnProperty(key)) return;
      let value = config[key];

      //增加配置项
      if (key[0] === '+') {
        key = key.slice(1);
        if (Array.isArray(this._config[key])) {
          this._config[key] = this._config[key].concat(value);
        } else if (typeof this._config[key] === 'object') {
          _.assign(this._config[key], value);
        } else {
          throw new Error(`Apply config error at '+${key}'`);
        }
      } else

      //移除配置项
      if (key[0] === '-') {
        key = key.slice(1);
        if (Array.isArray(this._config[key])) {
          this._config[key] = _.without.apply(_, [this._config[key]].concat(value));
        } else if (typeof this._config[key] === 'object') {
          let keys = [];
          if (typeof value === 'string') {
            keys = [value];
          } else if (Array.isArray(value)) {
            keys = value;
          } else {
            throw new Error(`Apply config error at '+${key}'`);
          }
          this._config[key] = _.omit.apply(_, [this._config[key]].concat(keys));
        } else {
          throw new Error(`Apply config error at '${key}'`);
        }
      } else

      //深度继承
      if (key[0] === '*') {
        key = key.slice(1);
        this._config[key] = _.defaultsDeep({}, value, this._config[key]);
      } else {
        this._config[key] = value;
      }
    }
  }

  /**
   * 判断当前Service是否是主Service
   * @returns Boolean
   */
  isMain() {
    return alaska.main === this;
  }

  /**
   * 获取koa app实例
   * @returns {koa.Application}
   */
  get app() {
    return alaska.app;
  }

  /**
   * 获取主Service实例
   * @returns {Service}
   */
  get main() {
    return alaska.main;
  }

  /**
   * 获取Service实例路由器
   * @returns {Router}
   */
  get router() {
    if (!this._router) {
      this._router = new Router({
        prefix: this.config('prefix'),
        methods: this.config('methods', ['GET', 'POST'])
      });
    }
    return this._router;
  }

  /**
   * 抛出严重错误,并输出调用栈
   * @method panic
   * @param {string|Error} message
   * @param {string|number} [code]
   */

  /**
   * 抛出普通异常
   * @method error
   * @param {string|Error} message
   * @param {string|number} [code]
   */

  /**
   * [async] 执行一个异步任务,如果失败则抛出NormalError
   * @method try
   * @param {Promise} promise
   * @returns {*}
   */

  /**
   * [async] 初始化
   * @method init
   */

  /**
   * [async] 加载多语言
   * @method loadLocales
   */

  /**
   * [async] 加载插件
   * @method loadPlugins
   */

  /**
   * [async] 加载数据模型
   * @method loadModels
   */

  /**
   * [async] 加载Sled列表
   * @method loadSleds
   */

  /**
   * [async] 载入Service中间件
   * @method loadMiddlewares
   */

  /**
   * [async] 载入API接口控制器
   * @method loadApi
   */

  /**
   * [async] 载入控制器
   * @method loadControllers
   */

  /**
   * [async] 加载资源服务
   * @method loadStatics
   */

  /**
   * [async] 挂载路由
   * @method mount
   */

  /**
   * [async] 启动Service
   * @method launch
   */
  async launch() {
    this.debug('launch');
    this.launch = util.resolved;
    try {
      await this.init();
      await this.loadConfig();
      await this.loadPlugins();
      await this.loadLocales();
      await this.loadModels();
      await this.loadSleds();
      await alaska.loadMiddlewares();
      await this.loadMiddlewares();
      await this.loadApi();
      await this.loadControllers();
      await this.loadStatics();
      await this.mount();
      await alaska.listen();
    } catch (error) {
      console.error('Alaska launch failed!');
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * 获取当前Service配置
   * @param {boolean} [mainAsDefault] 如果当前Service中不存在配置,则获取主Service的配置
   * @param {string} path 配置名
   * @param {*} [defaultValue] 默认值
   */
  config(mainAsDefault, path, defaultValue) {
    if (mainAsDefault !== true) {
      defaultValue = path;
      path = mainAsDefault;
      mainAsDefault = false;
    }
    let value = _.get(this._config, path, defaultValue);
    if (!mainAsDefault || value !== undefined || this.isMain()) {
      return value;
    }
    return alaska.config(path);
  }

  /**
   * 获取当前Service的数据链接
   * 如果本Service不是主Service且没有配置数据链接,则返回主配置链接
   * 如果返回false,代表本Service不需要数据库支持
   * @returns {mongoose.Connection | Boolean}
   */
  get db() {
    let me = this;
    if (me._db) {
      return me._db;
    }
    let config = me.config('db');
    if (config === false) {
      return false;
    }
    if (!config) {
      if (me.isMain()) {
        console.log('No database config');
      } else {
        me._db = me.alaska.db;
        return me._db;
      }
    }
    me._db = require('mongoose').createConnection(config);
    me._db.on('error', error => {
      console.error(error);
      process.exit(1);
    });
    return me._db;
  }

  /**
   * 获取默认缓存驱动
   * @returns {LruCacheDriver|*}
   */
  get cache() {
    if (!this._cache) {
      this._cache = this.createCacheDriver(this.config('cache'));
    }
    return this._cache;
  }

  /**
   * 创建或获取缓存驱动
   * @param {object|string} options 驱动初始化设置,如果为字符串,则获取指定id的当前实例
   * @param {boolean} [createNew] 如果为true则创建新驱动,否则使用之前的实例
   * @returns {LruCacheDriver|*}
   */
  createCacheDriver(options, createNew) {
    //options is driver id
    if (typeof options === 'string') {
      if (!this._cacheDrivers[options]) {
        throw new Error('Can not get cache driver ' + options);
      }
      return this._cacheDrivers[options];
    }
    if (options.isCacheDriver) {
      return options;
    }
    let driver;
    let id = options.id || JSON.stringify(options);
    if (createNew || !this._cacheDrivers[id]) {
      let Driver = require(options.type);
      driver = new Driver(options);
    }
    if (!this._cacheDrivers[id]) {
      this._cacheDrivers[id] = driver;
    }
    return driver;
  }

  /**
   * 通用创建驱动方法
   * @param options
   * @returns {Driver|*}
   */
  createDriver(options) {
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
    const Driver = require(options.type);
    let driver = new Driver(options);
    driver.idleId = idleId;
    driver.service = this;
    driver.idle = 0;
    return driver;
  }

  /**
   * 释放驱动
   * @param {Driver|*} driver
   */
  freeDriver(driver) {
    if (driver.idleId) {
      //允许空闲
      let idleId = driver.idleId;
      if (!this._idleDrivers[idleId]) {
        this._idleDrivers[idleId] = [];
      }
      if (this._idleDrivers[idleId].length > driver.options.idle) {
        this._idleDrivers[idleId].shift().destroy();
      }
      driver.free();
      driver.idle = Date.now();
      this._idleDrivers[idleId].push(driver);
      if (!this._freeIdleTimer) {
        this._freeIdleTimer = setInterval(() => this._destroyIdleDrivers(), 60 * 1000);
      }
    }
    driver.destroy();
  }

  /**
   * 销毁过期空闲驱动
   * @private
   */
  _destroyIdleDrivers() {
    for (let idleId in this._idleDrivers) {
      let drivers = this._idleDrivers[idleId];
      for (let i in drivers) {
        let d = drivers[i];
        if (d.idle && Date.now() - d.idle > 5 * 60 * 1000) {
          drivers.splice(i, 1);
          d.destroy();
          setImmediate(() => this._destroyIdleDrivers());
          return;
        }
      }
    }
  }

  /**
   * 获取模板引擎
   * @returns {*}
   */
  get engine() {
    if (!this._engine) {
      let config = this.config('render');
      if (typeof config === 'string') {
        config = { type: config };
      }
      let Engine = require(config.type);
      if (Engine.default) {
        Engine = Engine.default;
      }
      this._engine = new Engine(this, config);
    }
    return this._engine;
  }

  /**
   * 输出Service实例JSON调试信息
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      options: this._options,
      config: this._config,
      services: _.keys(this._services)
    };
  }

  /**
   * 获取所有Model
   * @returns {Object}
   */
  get models() {
    return this._models;
  }

  /**
   * 获取所有Sleds
   * @returns {Object}
   */
  get sleds() {
    return this._sleds;
  }

  /**
   * 找回此Service下定义的Model
   * @param {string} name 模型名称,例如User或blog.User
   * @param {boolean} [optional] 可选,默认false,如果为true则未找到时不抛出异常
   * @returns {Model|null}
   */
  model(name, optional) {
    if (this._models[name]) {
      return this._models[name];
    }

    let index = name.indexOf('.');
    if (index > -1) {
      let serviceId = name.substr(0, index);
      name = name.substr(index + 1);
      let service = this._services[serviceId];
      if (!service) {
        service = alaska.service(serviceId, optional);
      }
      if (service) {
        return service.model(name, optional);
      }
    }
    if (!optional) {
      this.panic(`"${name}" model not found`);
    }
  }

  /**
   * 注册模型
   * @param {Model} Model
   * @returns {Model}
   */
  async registerModel(Model) {
    Model.register();
    return Model;
  }

  /**
   * 找回此Service下定义的Sled
   * @param {string} name sled名称,例如Register或user.Register
   * @returns {Sled|null}
   */
  sled(name) {
    if (this._sleds[name]) {
      return this._sleds[name];
    }

    let index = name.indexOf('.');
    if (index > -1) {
      let serviceId = name.substr(0, index);
      name = name.substr(index + 1);
      let service = this._services[serviceId];
      if (!service) {
        service = alaska.service(serviceId);
      }
      if (service) {
        return service.sled(name);
      }
    }
    this.panic(`"${name}" sled not found`);
  }

  /**
   * 运行一个Sled
   * @param {string} name
   * @param {Object} data
   * @returns {*}
   */
  run(name, data) {
    try {
      let SledClass = this.sled(name);
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
  t(message, locale, values, formats) {
    if (!locale) {
      locale = this.config('defaultLocale');
    }
    let messages = this._locales[locale];
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
}
