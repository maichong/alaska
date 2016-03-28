/**
 * @copyright Maichong Software Ltd. 2015 http://maichong.it
 * @date 2015-11-18
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const Router = require('koa-router');
const collie = require('collie');
const util = require('./util');
const defaultConfig = require('./config');
const Sled = require('./Sled');
const debug = require('debug')('alaska');

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以依赖其他Service
 * 一个Service实例可以同时被多个Service依赖
 */
class Service {
  /**
   * 路由器
   * @type {Router}
   * @private
   */
  _router = null;
  _controllers = {};
  _apiControllers = {};
  /**
   * 本ServiceSled列表
   * @type {object}
   * @private
   */
  _sleds = {};
  /**
   * 本Service数据模型列表
   * @type {object}
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
   * @type {object}
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
   * 所依赖的子Service实例对象列表
   * @type {[Service]}
   * @private
   */
  _services = [];
  /**
   * 所依赖的子Service实例对象别名映射表
   * @type {object}
   * @private
   */
  _alias = {};
  util = util;
  noop = util.noop;

  /**
   * Model基类
   * @type {Model}
   */
  Model = require('./model');

  /**
   * Model基类
   * @type {Model}
   */
  Sled = null;

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   * @param {Alaska} alaska Service所属的Alaska实例
   */
  constructor(options, alaska) {
    const service = this;
    this.panic = alaska.panic;
    this.error = alaska.error;
    this.try = alaska.try;

    this.Sled = class ServiceSled extends Sled {
    };
    this.Sled.service = service;
    this.Sled.__defineGetter__('key', function () {
      return util.nameToKey(service.id + '.' + this.name);
    });

    collie(this, 'init', require('./service/init'));
    collie(this, 'loadModels', require('./service/loadModels'));
    collie(this, 'loadSleds', require('./service/loadSleds'));
    collie(this, 'route', require('./service/route'));
    collie(this, 'loadAppMiddlewares', require('./service/loadAppMiddlewares'));
    collie(this, 'loadMiddlewares', require('./service/loadMiddlewares'));
    collie(this, 'loadApi', require('./service/loadApi'));
    collie(this, 'loadControllers', require('./service/loadControllers'));
    collie(this, 'loadStatics', require('./service/loadStatics'));
    collie(this, 'launch');
    collie(this, 'registerModel');

    if (typeof options === 'string') {
      this._options = {
        id: options
      };
    } else {
      this._options = options ? options : {};
    }

    this.debug = debug;

    if (!this._options.dir) {
      throw new Error('Service dir is not specified.');
    }

    if (!this._options.configFile) {
      //Service默认配置文件
      this._options.configFile = this._options.id + '.js';
    }
    this.alaska = alaska;

    {
      //载入配置
      let configFilePath = this._options.dir + '/config/' + this._options.configFile;
      let config = util.include(configFilePath);
      if (config) {
        this._config = config;
      } else {
        console.warn('Missing config file %s', configFilePath);
      }
    }

    _.defaultsDeep(this._config, defaultConfig);

    this.alaska.registerService(this);
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
   * 追加配置项
   * @param {object} config
   */
  applyConfig(config) {
    this._config = _.assign({}, this._config, config);
  }

  /**
   * 判断当前Service是否是主Service
   * @returns Boolean
   */
  isMain() {
    return this.alaska.main === this;
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
   * @param message
   * @param code
   */

  /**
   * 抛出普通异常
   * @method error
   * @param {string|Error} message
   * @param {string|number} code
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
   * [async] 加载数据模型
   * @method loadModels
   */

  /**
   * [async] 加载Sled列表
   * @method loadSleds
   */

  /**
   * [async]配置路由
   * @method route
   */

  /**
   * [async] 载入APP中间件
   * @method loadAppMiddlewares
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
   * [async] 启动Service
   * @method launch
   */
  async launch() {
    debug('%s launch', this.id);
    this.launch = util.noop;

    await this.init();
    await this.loadModels();
    await this.loadSleds();
    await this.route();
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
    return this.alaska.config(path);
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
    me._db.on('error', function (error) {
      console.error(error);
      process.exit();
    });
    return me._db;
  }

  /**
   * 获取缓存驱动
   * @returns {LruCacheDriver|*}
   */
  get cache() {
    if (!this._cache) {
      let options = this.config('cache');
      if (_.isString(options)) {
        options = { type: options };
      }
      if (options.isCacheDriver) {
        //已经实例化的缓存驱动
        this._cache = options;
      } else {
        let Driver = require(options.type);
        this._cache = new Driver(options);
      }
    }
    return this._cache;
  }

  /**
   * 获取模板引擎
   * @returns {*}
   */
  get engine() {
    if (!this._engine) {
      this._engine = require(this.config('render'));
    }
    return this._engine;
  }

  /**
   * 获取当前Service所依赖的子Service
   * @returns {Service}
   */
  service(name) {
    return this._alias[name];
  }

  /**
   * 输出Service实例JSON调试信息
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      options: this._options,
      config: this._config,
      services: _.keys(this._alias)
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
   * 找回此Service下定义的Model
   * @param {string} name 模型名称,例如User或blog.User
   * @returns {Model|null}
   */
  model(name) {
    if (this._models[name]) {
      return this._models[name];
    }

    let index = name.indexOf('.');
    if (index > -1) {
      let serviceId = name.substr(0, index);
      name = name.substr(index + 1);
      let service = this._alias[serviceId];
      if (!service) {
        service = this.alaska.service(serviceId);
      }
      if (service) {
        return service.model(name);
      }
    }
    this.panic(`"${name}" model not found`);
  }

  /**
   * 注册模型
   * @param {Model} Model
   * @returns {Model}
   */
  async registerModel(Model) {
    global.__service = this;
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
      let service = this._alias[serviceId];
      if (!service) {
        service = this.alaska.service(serviceId);
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
   * @param {object} options
   * @returns {*}
   */
  run(name, options) {
    try {
      let Sled = this.sled(name);
      let sled = new Sled(options);
      return sled.run();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = Service;
