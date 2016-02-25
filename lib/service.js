'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2015 http://maichong.it
 * @date 2015-11-18
 * @author Liang <liang@maichong.it>
 */

const assert = require('assert');
const path = require('path');
const fs = require('mz/fs');
const _ = require('lodash');
const Router = require('koa-router');
const compose = require('koa-compose');
const collie = require('collie');
const mime = require('mime');
const util = require('./util');
const defaultConfig = require('./config');
const debug = require('debug')('alaska');

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
   * 所依赖的子Service实例对象别名映射表
   * @type {{}}
   * @private
   */

  /**
   * 本Service的所有额外配置目录
   * @type {Array}
   * @private
   */

  /**
   * 数据库连接实例
   * @type {mongoose.Connection}
   * @private
   */

  /**
   * 路由器
   * @type {Router}
   * @private
   */
  constructor(options, alaska) {
    this._router = null;
    this._controllers = {};
    this._apiControllers = {};
    this._models = {};
    this._db = null;
    this._config = {};
    this._configDirs = [];
    this._services = [];
    this._alias = {};
    this.util = util;
    this.noop = util.noop;
    this.Model = require('./model');

    collie(this, 'init');
    collie(this, 'load');
    collie(this, 'route');
    collie(this, 'launch');
    collie(this, 'registerModel');

    if (typeof options === 'string') {
      this._options = {
        id: options
      };
    } else {
      this._options = options ? options : {};
    }

    this.debug = require('debug')(this._options.id);

    this.debug('init');

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
   * 所依赖的子Service实例对象列表
   * @type {Array}
   * @private
   */

  /**
   * 本Service的配置项
   * @type {{}}
   * @private
   */

  /**
   * 本Service数据模型列表
   * @type {{}}
   * @private
   */


  get id() {
    return this._options.id;
  }

  get dir() {
    return this._options.dir;
  }

  /**
   * 追加配置项
   * @param {{}} config
   */
  applyConfig(config) {
    this._config = _.assign({}, this._config, config);
  }

  /**
   * 判断当前Service是否是主Service
   * @returns Boolean
   */
  isMain() {
    return this.alaska.mainService() === this;
  }

  /**
   * 获取Service实例路由器
   * @returns {Router}
   */
  router() {
    if (!this._router) {
      this._router = new Router({
        prefix: this.config('prefix'),
        methods: this.config('methods', ['GET', 'POST'])
      });
    }
    return this._router;
  }

  /**
   * 初始化
   */
  init() {
    var _this = this;

    return _asyncToGenerator(function* () {
      debug('%s init', _this.id);
      _this.init = util.noop;

      //加载扩展配置
      for (let dir of _this._configDirs) {
        let configFile = dir + '/config.js';
        if (util.isFile(configFile)) {
          _this.applyConfig(require(configFile).default);
        }
      }

      let services = _this.config('services') || [];
      if (typeof services === 'string') {
        services = [services];
      }

      for (let service of services) {
        if (typeof service === 'string') {
          service = { id: service };
        }
        let serviceId = service.id;
        let serviceAlias = service.alias;
        assert(typeof serviceId === 'string', 'Sub service id should be string.');
        let sub = _this.alaska.service(serviceId);
        _this._services.push(sub);
        assert(!_this._alias[serviceId], 'Service alias is exists.');
        _this._alias[serviceId] = sub;
        if (serviceAlias) {
          assert(!_this._alias[serviceAlias], 'Service alias is exists.');
          _this._alias[serviceAlias] = sub;
        }
        let configDir = _this.dir + '/config/' + serviceId;
        if (util.isDirectory(configDir)) {
          sub._configDirs.push(configDir);
        }
        yield sub.init();
      }
    })();
  }

  /**
   * 加载
   */
  load() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      debug('%s load', _this2.id);
      _this2.load = util.noop;

      for (let service of _this2._services) {
        yield service.load();
      }

      if (_this2.config('db') !== false) {
        global.__service = _this2;
        _this2._models = util.include(_this2.dir + '/models');
        //遍历模型
        for (let name in _this2._models) {
          let Model = _this2._models[name];
          //加载扩展配置
          for (let dir of _this2._configDirs) {
            let file = dir + '/models/' + name + '.js';
            if (util.isFile(file)) {
              let ext = require(file);
              ['fields', 'groups', 'api'].forEach(key => {
                if (typeof ext[key] !== 'undefined') {
                  _.assign(Model[key], ext[key]);
                }
              });
              //扩展模型事件
              ['Init', 'Validate', 'Save', 'Remove'].forEach(Action => {
                let pre = ext['pre' + Action];
                if (pre) {
                  Model.pre(Action.toLowerCase(), pre);
                }
                let post = ext['post' + Action];
                if (post) {
                  Model.post(Action.toLowerCase(), post);
                }
              });
              if (ext['default']) {
                ext['default'](Model);
              }
            }
          } //end of 加载扩展配置
          yield _this2.registerModel(Model);
        } //end of 遍历模型
      }
    })();
  }

  /**
   * 载入APP中间件
   * @private
   */
  _loadAppMiddlewares() {
    this._loadAppMiddlewares = util.noop;
    let app = this.alaska.app();
    let alaska = this.alaska;
    let service = this;
    app.use(function (ctx, next) {
      ctx.set('X-Powered-By', 'Alaska');
      ctx.service = service;
      ctx.alaska = alaska;

      /**
       * 发送文件
       * @param {string} filePath
       * @param {{}} options
       */
      ctx.sendfile = function () {
        var ref = _asyncToGenerator(function* (filePath, options) {
          options = options || {};
          let trailingSlash = '/' == filePath[filePath.length - 1];
          let index = options.index;
          if (index && trailingSlash) filePath += index;
          let maxage = options.maxage || options.maxAge || 0;
          let hidden = options.hidden || false;
          if (!hidden && util.isHidden(filePath)) return;

          let stats;
          try {
            stats = yield fs.stat(filePath);
            if (stats.isDirectory()) {
              if (index) {
                filePath += '/' + index;
                stats = yield fs.stat(filePath);
              } else {
                return;
              }
            }
          } catch (err) {
            let notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
            if (~notfound.indexOf(err.code)) return;
            err.status = 500;
            throw err;
          }
          ctx.set('Last-Modified', stats.mtime.toUTCString());
          ctx.set('Content-Length', stats.size);
          ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
          ctx.type = options.type || mime.lookup(filePath);
          ctx.body = fs.createReadStream(filePath);
        });

        return function (_x, _x2) {
          return ref.apply(this, arguments);
        };
      }();
      return next();
    });
    this.config('appMiddlewares', []).forEach(function (name) {
      if (typeof name === 'function') {
        //数组中直接就是一个中间件函数
        app.use(name);
        return;
      }
      let options;
      if (typeof name === 'object') {
        options = name.options;
        name = name.name;
      }
      if (name.startsWith('.')) {
        //如果是一个文件路径
        name = service.dir + '/' + name;
      }
      let middleware = require(name);
      app.use(middleware(options));
    });
  }

  /**
   * 载入Service中间件
   * @private
   */
  _loadServiceMiddlewares() {
    let router = this.router();

    //middlewares for service
    this.config('middlewares', []).forEach(function (item) {
      if (typeof item === 'string') {
        item = {
          name: item
        };
      }
      let name = item.name;
      if (name.startsWith('.')) {
        name = this.dir + name;
      }
      let middleware = require(name);
      let path = item.path;
      if (!path) {
        router.use(path, middleware(item.options));
        return;
      }
      let methods = item.methods || ['GET', 'POST'];
      if (methods === 'all') {
        router.all(path, middleware(item.options));
        return;
      }
      if (typeof methods === 'string') {
        methods = [methods];
      }
      router.register(path, methods, middleware(item.options));
    });
  }

  /**
   * 载入API接口控制器
   * @private
   */
  _loadApiControllers() {
    let alaska = this.alaska;
    let service = this;
    let router = this.router();

    this._apiControllers = util.include(this.dir + '/api');
    let defaultApiController = require('./api');
    let bodyParser = require('koa-bodyparser')();

    //TODO 优化性能
    function restApi(action) {
      return function (ctx, next) {

        function onError(error) {
          console.error(service.id + ' API ' + error.stack);
          if (!ctx.body) {
            if (ctx.status === 404) {
              ctx.status = 500;
            }
            ctx.body = {
              error: error.message
            };
          }
        }

        try {
          if (['show', 'update', 'remove'].indexOf(action) > -1) {
            if (!/^[a-f0-9]{24}$/.test(ctx.params.id)) {
              ctx.status = alaska.BAD_REQUEST;
              return;
            }
          }
          //console.log(ctx.params.model);
          //console.log(service);
          //console.log(service._models);
          let Model = service._models[ctx.params.model];
          //console.log(Model);
          if (!Model) {
            //404
            return;
          }
          let modelId = ctx.params.model.toLowerCase();
          let middlewares = [];

          // api 目录下定义的中间件
          if (service._apiControllers[modelId] && service._apiControllers[modelId][action]) {
            middlewares.push(service._apiControllers[modelId][action]);
          }

          // Model.api参数定义的中间件
          if (Model.api && Model.api[action]) {
            middlewares.push(defaultApiController[action]);
          }
          //console.log(middlewares);

          if (!middlewares.length) {
            //404
            return;
          }
          ctx.Model = Model;
          return compose(middlewares)(ctx).catch(onError);
        } catch (error) {
          onError(error);
          return;
        }
      };
    }

    router.get('/api/:model/count', restApi('count'));
    router.get('/api/:model/:id', restApi('show'));
    router.get('/api/:model', restApi('list'));
    router.post('/api/:model', bodyParser, restApi('create'));
    router.put('/api/:model/:id', bodyParser, restApi('update'));
    router.del('/api/:model/:id', restApi('remove'));
  }

  /**
   * 载入控制器
   * @private
   */
  _loadControllers() {
    let router = this.router();
    let service = this;

    this._controllers = util.include(this.dir + '/controllers', false) || {};

    router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], function () {
      var ref = _asyncToGenerator(function* (ctx, next) {
        let controller = ctx.params.controller || service.config('defaultController');
        let action = ctx.params.action || service.config('defaultAction');
        service.debug('route %s:%s', controller, action);
        if (service._controllers[controller] && service._controllers[controller][action] && action[0] !== '_') {
          let promise = service._controllers[controller][action](ctx, next);
          //异步函数
          if (promise && promise.then) {
            yield promise;

            //正在渲染页面
            if (ctx._showing) {
              yield ctx._showing;
            }
          }
          //同步函数,并且正在渲染中
          if (ctx._showing) {
            return ctx._showing;
          }
          //同步函数,直接返回,并且没有渲染页面
          return;
        }
        yield next();
      });

      return function (_x3, _x4) {
        return ref.apply(this, arguments);
      };
    }()); //end of register
  }

  /**
   * 加载资源服务
   * @private
   */
  _loadStatics() {
    let service = this;
    let router = this.router();
    let statics = [];
    {
      let tmp = this.config('statics');
      if (tmp && typeof tmp === 'string') {
        statics.push({ root: tmp, prefix: '' });
      } else if (_.isArray(tmp)) {
        tmp.forEach(t => {
          if (t && typeof t === 'string') {
            statics.push({ root: t, prefix: '' });
          } else if (_.isObject(t) && t.root) {
            statics.push(t);
          }
        });
      } else if (_.isObject(tmp) && tmp.root) {
        statics.push(tmp);
      }
    }
    if (statics.length) {
      statics.forEach(c => {
        let root = path.resolve(service.dir, c.root);
        let prefix = (c.prefix || '') + '/*';
        let prefixLength = this.config('prefix').length + c.prefix.length;
        let index = c.index === false ? false : c.index || 'index.html';
        router.register(prefix, ['GET', 'HEAD'], function () {
          var ref = _asyncToGenerator(function* (ctx, next) {
            yield next();
            if (ctx.body != null || ctx.status != 404) return;
            let filePath = root;
            if (prefixLength) {
              filePath += ctx.path.substr(prefixLength);
            } else {
              filePath += ctx.path;
            }
            yield ctx.sendfile(filePath, {
              index,
              maxAge: c.maxAge
            });
          });

          return function (_x5, _x6) {
            return ref.apply(this, arguments);
          };
        }());
      });
    }
  }

  /**
   * 配置路由
   * @fires Service#route
   */
  route() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      debug('%s route', _this3.id);
      _this3.route = util.noop;

      let app = _this3.alaska.app();
      let service = _this3;
      let router = _this3.router();

      if (_this3.isMain()) {
        _this3._loadAppMiddlewares();
      }

      //配置子Service路由
      for (let sub of _this3._services) {
        yield sub.route();
      }

      _this3._loadServiceMiddlewares();

      //API 接口
      if (_this3.config('api')) {
        _this3._loadApiControllers();
      }

      //控制器
      if (_this3.config('controllers')) {
        _this3._loadControllers();
      }

      //静态服务
      _this3._loadStatics();

      //路由表
      let routes = router.routes();
      //精确匹配域名
      let exact = true;
      //Service域名
      let domain = _this3.config('domain', '');
      if (domain.startsWith('*.')) {
        domain = domain.substr(2);
        exact = false;
      }
      //如果是主域名,匹配失败后的跳转地址
      let redirect;
      if (_this3.isMain()) {
        redirect = _this3.config('redirect', '');
      }

      let templatesDir = path.join(_this3.dir, _this3.config('templates')) + '/';

      app.use(function (ctx, next) {
        ctx.subdomain = '';
        ctx.service = service;

        if (domain) {
          let hostname = ctx.hostname;
          if (exact) {
            //如果精确匹配域名
            if (hostname !== domain) {
              redirect && ctx.redirect(redirect);
              return;
            }
          } else {
            //分析子域名
            let index = hostname.lastIndexOf(domain);
            if (index === -1) {
              redirect && ctx.redirect(redirect);
              return;
            }
            ctx.subdomain = hostname.substring(0, index - 1);
          }
        }
        //domain not set

        let toJSON = ctx.toJSON;
        ctx.toJSON = function () {
          let json = toJSON.call(ctx);
          json.subdomain = ctx.subdomain;
          json.alaska = ctx.alaska.toJSON();
          json.service = ctx.service.toJSON();
          return json;
        };

        ctx.locals = {};
        ctx.render = function (template, locals) {
          let engine = service.engine();
          let path = templatesDir + template;
          if (!util.isFile(path)) {
            throw new Error(`Template is not exist: ${ path }`);
          }
          return new Promise((resolve, reject) => {
            engine.renderFile(path, _.assign({}, ctx.locals, locals), (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            });
          });
        };

        ctx.show = function (template, locals) {
          ctx._showing = new Promise(function (resolve, reject) {
            ctx.render(template, locals).then(html => {
              delete ctx._showing;
              ctx.body = html;
              resolve(html);
            }, error => {
              delete ctx._showing;
              reject(error);
            });
          });
        };

        return routes(ctx, next);
      });
    })();
  }

  /**
   * 启动Service
   * @fires Service#launch
   */
  launch() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      debug('%s launch', _this4.id);
      _this4.launch = util.noop;

      yield _this4.init();
      yield _this4.load();
      yield _this4.route();
    })();
  }

  /**
   * 获取当前Service配置
   * @param {Boolean} [mainAsDefault] 如果当前Service中不存在配置,则获取主Service的配置
   * @param {String} path 配置名
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
  db() {
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
        me._db = me.alaska.db();
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
   * 获取模板引擎
   * @returns {*}
   */
  engine() {
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
      services: _.keys(this._alias)
    };
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
    throw new Error(`"${ name }" model not found`);
  }

  registerModel(Model) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      global.__service = _this5;
      Model.register();
      return Model;
    })();
  }

}

module.exports = Service;