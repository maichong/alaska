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

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _sled = require('./sled');

var _sled2 = _interopRequireDefault(_sled);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2015 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2015-11-18
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以依赖其他Service
 * 一个Service实例可以同时被多个Service依赖
 */
class Service {

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   * @param {Alaska} alaska Service所属的Alaska实例
   */


  /**
   * Model基类
   * @type {Model}
   */

  /**
   * 所依赖的子Service实例对象别名映射表
   * @type {Object}
   * @private
   */

  /**
   * 本Service的所有额外配置目录
   * @type {[string]}
   * @private
   */

  /**
   * 数据库连接实例
   * @type {mongoose.Connection}
   * @private
   */

  /**
   * 本ServiceSled列表
   * @type {Object}
   * @private
   */
  constructor(options, alaska) {
    this._router = null;
    this._controllers = {};
    this._apiControllers = {};
    this._locales = {};
    this._messageCache = {};
    this._sleds = {};
    this._models = {};
    this._db = null;
    this._config = {};
    this._configDirs = [];
    this._services = [];
    this._alias = {};
    this.util = util;
    this.Model = _model2.default;
    this.Sled = null;

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
    this.debug = (0, _debug2.default)(options.id);
    this.panic = alaska.panic;
    this.error = alaska.error;
    this.try = alaska.try;

    this.Sled = class ServiceSled extends _sled2.default {};
    this.Sled.service = service;
    this.Sled.__defineGetter__('key', function () {
      return util.nameToKey(service.id + '.' + this.name);
    });

    (0, _collie2.default)(this, 'init', require('./service/init').default);
    (0, _collie2.default)(this, 'loadLocales', require('./service/loadLocales').default);
    (0, _collie2.default)(this, 'loadModels', require('./service/loadModels').default);
    (0, _collie2.default)(this, 'loadSleds', require('./service/loadSleds').default);
    (0, _collie2.default)(this, 'loadMiddlewares', require('./service/loadMiddlewares').default);
    (0, _collie2.default)(this, 'loadApi', require('./service/loadApi').default);
    (0, _collie2.default)(this, 'loadControllers', require('./service/loadControllers').default);
    (0, _collie2.default)(this, 'loadStatics', require('./service/loadStatics').default);
    (0, _collie2.default)(this, 'mount', require('./service/mount').default);
    (0, _collie2.default)(this, 'launch');
    (0, _collie2.default)(this, 'registerModel');

    {
      //载入配置
      let configFilePath = this._options.dir + '/config/' + this._options.configFile;
      let config = util.include(configFilePath, true, { alaska, service });
      if (config) {
        this._config = config;
      } else {
        console.warn('Missing config file %s', configFilePath);
      }
    }

    _lodash2.default.defaultsDeep(this._config, _config2.default);

    this.alaska.registerService(this);
  }

  /**
   * Service id
   * @returns {string}
   */


  /**
   * Model基类
   * @type {Model}
   */

  /**
   * 所依赖的子Service实例对象列表
   * @type {[Service]}
   * @private
   */

  /**
   * 本Service的配置项
   * @type {Object}
   * @private
   */

  /**
   * 本Service数据模型列表
   * @type {Object}
   * @private
   */

  /**
   * 路由器
   * @type {Router}
   * @private
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
   * 追加配置项
   * @param {Object} config
   */
  applyConfig(config) {
    for (let key in config) {
      if (!config.hasOwnProperty(key)) {
        return;
      }
      let value = config[key];

      //增加配置项
      if (key[0] === '+') {
        key = key.slice(1);
        if (Array.isArray(this._config[key])) {
          this._config[key] = this._config[key].concat(value);
        } else if (typeof this._config[key] === 'object') {
          _lodash2.default.assign(this._config[key], value);
        } else {
          throw new Error(`Apply config error at '+${ key }'`);
        }
      } else

        //移除配置项
        if (key[0] === '-') {
          key = key.slice(1);
          if (Array.isArray(this._config[key])) {
            this._config[key] = _lodash2.default.without.apply(_lodash2.default, [this._config[key]].concat(value));
          } else if (typeof this._config[key] === 'object') {
            let keys = [];
            if (typeof value === 'string') {
              keys = [value];
            } else if (Array.isArray(value)) {
              keys = value;
            } else {
              throw new Error(`Apply config error at '+${ key }'`);
            }
            this._config[key] = _lodash2.default.omit.apply(_lodash2.default, [this._config[key]].concat(keys));
          } else {
            throw new Error(`Apply config error at '${ key }'`);
          }
        } else

          //深度继承
          if (key[0] === '*') {
            key = key.slice(1);
            this._config[key] = _lodash2.default.defaultsDeep({}, value, this._config[key]);
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
    return this.alaska.main === this;
  }

  /**
   * 获取koa app实例
   * @returns {koa.Application}
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
  launch() {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.debug('launch');
      _this.launch = util.resolved;
      try {
        yield _this.init();
        yield _this.loadLocales();
        yield _this.loadModels();
        yield _this.loadSleds();
        yield _this.alaska.loadMiddlewares();
        yield _this.loadMiddlewares();
        yield _this.loadApi();
        yield _this.loadControllers();
        yield _this.loadStatics();
        yield _this.mount();
        yield _this.alaska.listen();
      } catch (error) {
        console.error('Alaska launch failed!');
        console.error(error.stack);
        throw error;
      }
    })();
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
    let value = _lodash2.default.get(this._config, path, defaultValue);
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
    me._db.on('error', error => {
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
      if (_lodash2.default.isString(options)) {
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
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      options: this._options,
      config: this._config,
      services: _lodash2.default.keys(this._alias)
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
    this.panic(`"${ name }" model not found`);
  }

  /**
   * 注册模型
   * @param {Model} Model
   * @returns {Model}
   */
  registerModel(Model) {
    return _asyncToGenerator(function* () {
      Model.register();
      return Model;
    })();
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
    this.panic(`"${ name }" sled not found`);
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
    if (!this._locales[locale] || !this._locales[locale][message]) {
      return message;
    }
    if (!values) {
      return this._locales[locale][message];
    }
    if (!this._messageCache[locale]) {
      this._messageCache[locale] = {};
    }
    if (!this._messageCache[locale][message]) {
      this._messageCache[locale][message] = new _intlMessageformat2.default(this._locales[locale][message], locale, formats);
    }
    return this._messageCache[locale][message].format(values);
  }
}
exports.default = Service;