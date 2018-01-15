'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _collie = require('collie');

var _collie2 = _interopRequireDefault(_collie);

var _intlMessageformat = require('intl-messageformat');

var _intlMessageformat2 = _interopRequireDefault(_intlMessageformat);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _depd = require('depd');

var _depd2 = _interopRequireDefault(_depd);

var _alaska = require('./alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const deprecate = (0, _depd2.default)('alaska.service');

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以依赖其他Service
 * 一个Service实例可以同时被多个Service依赖
 */


/* eslint global-require:0 */

class Service {

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   */

  /**
   * 本Service的所有模板目录
   * @type {[string]}
   * @private
   */

  /**
   * 数据库连接实例
   * @type {mongoose.Connection}
   * @private
   */

  /**
   * 本Service数据模型列表
   * @type {Object}
   */

  /**
   * 本Service Sled列表
   * @type {Object}
   */
  constructor(options) {
    this._controllers = {};
    this._apiControllers = {};
    this._freeIdleTimer = 0;
    this._config = {};
    this.version = '';

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
    this.alaska = _alaska2.default;
    /* eslint new-cap:0 */
    this.debug = (0, _debug2.default)(options.id);
    this.panic = _alaska2.default.panic;
    this.error = _alaska2.default.error;
    this.debug('constructor');

    (0, _collie2.default)(this, 'init', require('./service/init').default);
    (0, _collie2.default)(this, 'loadConfig', require('./service/loadConfig').default);
    (0, _collie2.default)(this, 'loadPlugins', require('./service/loadPlugins').default);
    (0, _collie2.default)(this, 'loadLocales', require('./service/loadLocales').default);
    (0, _collie2.default)(this, 'loadModels', require('./service/loadModels').default);
    (0, _collie2.default)(this, 'loadSleds', require('./service/loadSleds').default);
    (0, _collie2.default)(this, 'loadRoutes', require('./service/loadRoutes').default);
    (0, _collie2.default)(this, 'loadApi', require('./service/loadApi').default);
    (0, _collie2.default)(this, 'loadControllers', require('./service/loadControllers').default);
    (0, _collie2.default)(this, 'loadStatics', require('./service/loadStatics').default);
    (0, _collie2.default)(this, 'mount', require('./service/mount').default);
    (0, _collie2.default)(this, 'launch');
    (0, _collie2.default)(this, 'registerModel');

    this._config = _lodash2.default.defaultsDeep({}, _config2.default);

    // $Flow
    _alaska2.default.registerService(this);
  }

  /**
   * Service id
   * @returns {string}
   */

  /**
   * 本Service的配置项
   * @type {Object}
   * @private
   */

  /**
   * 本Service本地化配置
   * @type {Object}
   */

  /**
   * 本Service Plugin列表
   * @type {Object}
   */

  /**
   * 所依赖的子Service实例对象别名映射表
   * @type {Object}
   */
  get id() {
    return this.options.id;
  }

  /**
   * Service 目录
   * @returns {string}
   */
  get dir() {
    return this.options.dir;
  }

  get configFile() {
    // $Flow
    return this.options.configFile;
  }

  /**
   * 获取koa app实例
   * @returns {Koa}
   */
  get app() {
    return this.alaska.app;
  }

  /**
   * 获取主Service实例
   * @returns {Service}
   */
  get main() {
    return this.alaska.main;
  }

  /**
   * 获取Service实例路由器
   * @returns {Router}
   */
  get router() {
    if (!this._router) {
      this._router = new _koaRouter2.default({
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
  get serviceList() {
    return _lodash2.default.values(this.services);
  }

  /**
   * 获取Model列表数组
   * @returns {[Model]}
   */
  get modelList() {
    return _lodash2.default.values(this.models);
  }

  /**
   * 获取Sled列表数组
   * @returns {[Sled]}
   */
  get sledList() {
    return _lodash2.default.values(this.sleds);
  }

  /**
   * 获取当前Service的数据链接
   * 如果本Service不是主Service且没有配置数据链接,则返回主配置链接
   * 如果返回false,代表本Service不需要数据库支持
   * @returns {mongoose.Connection | Boolean}
   */
  get db() {
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
    this._db = _mongoose2.default.createConnection(config);
    this._db.on('error', error => {
      console.error(error);
      process.exit(1);
    });
    return this._db;
  }

  /**
   * 获取默认缓存驱动
   * @returns {LruCacheDriver|*}
   */
  get cache() {
    if (!this._cache) {
      let config = this.getConfig('cache');
      if (!config || !config.type) this.panic(`Service '${this.id}' without cache driver!`);
      // $Flow
      this._cache = this.createDriver(config);
    }
    return this._cache;
  }

  /**
   * 获取模板引擎
   * @returns {*}
   */
  get renderer() {
    if (!this._renderer) {
      let config = this.getConfig('renderer');
      if (!config || !config.type) this.panic(`Service '${this.id}' without rendering engine!`);
      if (typeof config === 'string') {
        config = { type: config };
      }
      let Renderer = _alaska2.default.modules.renderers[config.type];
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
    return _alaska2.default.main === this;
  }

  /**
   * 追加配置项
   * @param {Object} config
   */
  applyConfig(config) {
    utils.merge(this._config, config);
  }

  /**
   * 获取当前Service配置
   * @deprecated
   * @param {string} key 配置名
   * @param {*} [defaultValue] 默认值
   * @param {boolean} [mainAsDefault] 如果当前Service中不存在配置,则获取主Service的配置
   */
  config(key, defaultValue, mainAsDefault) {
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
  getConfig(key, defaultValue, mainAsDefault) {
    let value = _lodash2.default.get(this._config, key, defaultValue);
    if (!mainAsDefault || value !== undefined || this.isMain()) {
      return value;
    }
    return _alaska2.default.getConfig(key);
  }

  /**
   * 启动Service
   * @method launch
   */
  async launch(modules) {
    this.debug('launch');
    // $Flow
    this.launch = utils.resolved;
    _lodash2.default.forEach(modules.services, service => {
      _lodash2.default.forEach(service.models, (Model, name) => {
        if (!Model.modelName) {
          Model.modelName = name;
        }
        if (!Model.service && service.service) {
          Model.service = service.service;
        }
      });
      _lodash2.default.forEach(service.sleds, (Sled, name) => {
        if (!Sled.sledName) {
          Sled.sledName = name;
        }
        if (!Sled.key) {
          Sled.key = utils.nameToKey(service.service.id + '.' + name);
        }
        if (!Sled.service && service.service) {
          Sled.service = service.service;
        }
      });
    });
    _alaska2.default.modules = modules;
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
    await _alaska2.default.loadMiddlewares();
    await _alaska2.default.listen();
  }

  /**
   * 通用创建驱动方法
   * @param {Object} options
   * @returns {Driver}
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
    const Driver = _alaska2.default.modules.drivers[options.type];
    if (!Driver) throw new _alaska.PanicError(`Driver '${options.type}' not found!`);
    let driver = new Driver(this, options);
    driver.idleId = idleId;
    driver.idle = 0;
    return driver;
  }

  /**
   * 释放驱动
   * @param {Driver|*} driver
   */
  freeDriver(driver) {
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
    Object.keys(this._idleDrivers).forEach(idleId => {
      let drivers = this._idleDrivers[idleId];
      for (let d of drivers) {
        if (d.idle && Date.now() - d.idle > 5 * 60 * 1000) {
          _lodash2.default.pull(drivers, d);
          d.destroy();
        }
      }
    });
  }

  /**
   * 注册模型
   * @param {Model} Model
   * @returns {Model}
   */
  async registerModel(Model) {
    await Model.register();
    return Model;
  }

  /**
   * 获取指定Model
   * @deprecated
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {Model|null}
   */
  model(modelName) {
    deprecate('model()');
    return this.getModel(modelName);
  }

  /**
   * 获取指定Model
   * @since 0.12.0
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {Model}
   */
  getModel(modelName) {
    if (_lodash2.default.isObject(this.models[modelName])) {
      return this.models[modelName];
    }

    let index = modelName.indexOf('.');
    if (index > -1) {
      let serviceId = modelName.substr(0, index);
      modelName = modelName.substr(index + 1);
      return _alaska2.default.getService(serviceId).getModel(modelName);
    }
    throw new _alaska.PanicError(`"${modelName}" model not found`);
  }

  /**
   * 判断是否存在指定Model
   * @since 0.12.0
   * @param {string} modelName 模型名称,例如User或blog.User
   * @returns {boolean}
   */
  hasModel(modelName) {
    if (_lodash2.default.isObject(this.models[modelName])) {
      return true;
    }
    let index = modelName.indexOf('.');
    if (index > -1) {
      let serviceId = modelName.substr(0, index);
      if (!_alaska2.default.hasService(serviceId)) return false;
      modelName = modelName.substr(index + 1);
      return _alaska2.default.getService(serviceId).hasModel(modelName);
    }
    return false;
  }

  /**
   * 获取指定Sled
   * @deprecated
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {Sled}
   */
  sled(sledName) {
    deprecate('sled()');
    return this.getSled(sledName);
  }

  /**
   * 获取指定Sled
   * @since 0.12.0
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {Sled}
   */
  getSled(sledName) {
    if (this.sleds[sledName]) {
      return this.sleds[sledName];
    }
    let index = sledName.indexOf('.');
    if (index > -1) {
      let serviceId = sledName.substr(0, index);
      if (_alaska2.default.hasService(serviceId)) {
        sledName = sledName.substr(index + 1);
        return _alaska2.default.getService(serviceId).getSled(sledName);
      }
    }
    throw new _alaska.PanicError(`"${sledName}" sled not found`);
  }

  /**
   * 判断指定Sled是否存在
   * @since 0.12.0
   * @param {string} sledName sled名称,例如Register或user.Register
   * @returns {boolean}
   */
  hasSled(sledName) {
    if (_lodash2.default.isObject(this.sleds[sledName])) {
      return true;
    }
    let index = sledName.indexOf('.');
    if (index > -1) {
      let serviceId = sledName.substr(0, index);
      if (!_alaska2.default.hasService(serviceId)) return false;
      sledName = sledName.substr(index + 1);
      return _alaska2.default.getService(serviceId).hasSled(sledName);
    }
    return false;
  }

  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName, data) {
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
  t(message, locale, values, formats) {
    if (!locale) {
      locale = this.getConfig('defaultLocale');
    }
    let messages = this.locales[locale];
    if (!messages) {
      messages = _alaska2.default.locales[locale];
      if (!messages) return message;
    }
    let template = messages[message];
    if (!template) {
      if (_alaska2.default.locales[locale]) template = _alaska2.default.locales[locale][message];
      if (!template) return message;
    }
    if (!values) {
      return template;
    }
    if (!this._messageCache[locale]) {
      this._messageCache[locale] = {};
    }
    if (!this._messageCache[locale][message]) {
      this._messageCache[locale][message] = new _intlMessageformat2.default(template, locale, formats);
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
    Object.keys(this._apiControllers).forEach(key => {
      let c = this._apiControllers[key];
      res.api[key] = Object.keys(c).filter(name => name[0] !== '_');
    });
    Object.keys(this._controllers).forEach(key => {
      let c = this._controllers[key];
      res.controllers[key] = Object.keys(c).filter(name => name[0] !== '_');
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


  /**
   * 抛出普通异常
   * @method error
   * @param {string|Error} message
   * @param {string|number} [code]
   */


  /**
   * 执行一个异步任务,如果失败则抛出NormalError
   * @method try
   * @param {Promise} promise
   * @returns {Promise<T>}
   */


  /**
   * 初始化
   * @method init
   */


  /**
   * 加载配置
   * @method loadConfig
   */


  /**
   * 加载多语言
   * @method loadLocales
   */


  /**
   * 加载插件
   * @method loadPlugins
   */


  /**
   * 加载数据模型
   * @method loadModels
   */


  /**
   * 加载Sled列表
   * @method loadSleds
   */


  /**
   * 载入Service中间件
   * @method loadRoutes
   */


  /**
   * 载入API接口控制器
   * @method loadApi
   */


  /**
   * 载入控制器
   * @method loadControllers
   */


  /**
   * 加载资源服务
   * @method loadStatics
   */


  /**
   * 挂载路由
   * @method mount
   */
}
exports.default = Service;
Service.classOfService = true;