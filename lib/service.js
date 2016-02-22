'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2015 http://maichong.it
 * @date 2015-11-18
 * @author Liang <liang@maichong.it>
 */

const assert = require('assert');
const _ = require('lodash');
const Router = require('koa-router');
const compose = require('koa-compose');
const collie = require('collie');
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
  constructor(options, alaska) {
    this._router = false;
    this._controllers = {};
    this._apiControllers = {};
    this._models = {};
    this._db = null;
    this._config = {};
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
    this.id = this._options.id;
    this.alaska = alaska;

    {
      //载入配置
      let configFilePath = this._options.dir + '/configs/' + this._options.configFile;
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
      debug('%s load', _this.id);
      _this.init = util.noop;

      let services = _this.config('services') || [];
      if (typeof services === 'string') {
        services = [services];
      }

      for (let service of services) {
        let serviceId = service;
        let serviceAlias = '';
        if (service.alias) {
          //如果Service配置有别名
          serviceAlias = service.alias;
          serviceId = service.id;
        }
        assert(typeof serviceId === 'string', 'Sub service id should be string.');
        let sub = _this.alaska.service(serviceId);
        _this._services.push(sub);
        assert(!_this._alias[serviceId], 'Service alias is exists.');
        _this._alias[serviceId] = sub;
        if (serviceAlias) {
          assert(!_this._alias[serviceAlias], 'Service alias is exists.');
          _this._alias[serviceAlias] = sub;
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
        _this2._models = util.include(_this2._options.dir + '/models');
        for (let name in _this2._models) {
          yield _this2.registerModel(_this2._models[name]);
        }
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
      ctx.service = service;
      ctx.alaska = alaska;
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
        name = this._options.dir + '/' + name;
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
        name = this._options.dir + name;
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

    this._apiControllers = util.include(this._options.dir + '/api');
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

    this._controllers = util.include(this._options.dir + '/controllers', false);

    router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], function (ctx, next) {
      let controller = ctx.params.controller || service.config('defaultController');
      let action = ctx.params.action || service.config('defaultAction');
      service.debug('route %s:%s', controller, action);
      if (service._controllers[controller] && service._controllers[controller][action] && action[0] !== '_') {
        return service._controllers[controller][action](ctx, next);
      }
      next();
    });
  }

  /**
   * 配置路由
   * @fires Service#route
   */
  route() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      debug('route %s', _this3.id);
      _this3.route = util.noop;

      let app = _this3.alaska.app();
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

      let service = _this3;

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

        return routes(ctx, next);
      });
    })();
  }

  /**
   * 启动Service
   * @fires Service#start
   */
  launch() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      debug('%s start', _this4.id);
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