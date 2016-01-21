/**
 * @copyright Maichong Software Ltd. 2015 http://maichong.it
 * @date 2015-11-18
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const Router = require('koa-router');
const compose = require('koa-compose');
const collie = require('collie');
const util = require('./util');
const defaultConfig = require('config');
const debug = require('debug')('alaska');

/**
 * Service指代一个项目中某些功能组件的集合,包括控制器/数据模型/视图和配置信息等
 * 一个Alaska实例包含一个主Service实例
 * Service实例可以以树状依赖关系加载其他Service
 * 在一个Alaska实例中,同一个Service,只能被依赖一次,但是可以被引用多次
 * 依赖是Service之间组装/调用的强关系,多个Service之间不能循环依赖,只能树状依赖
 * 如果A依赖B,B依赖C,那么A不能依赖C,不能依赖A
 */
class Service {
  _router = false;
  _controllers = {};
  _restControllers = {};
  _models = {};
  _db = null;
  _config = {};
  noop = util.noop;

  /**
   * 实例化一个Service对象
   * @param {Object|string} options 初始化参数,如果为string,则代表Service的id
   * @param {Alaska} alaska Service所属的Alaska实例
   */
  constructor(options, alaska) {
    collie(this, 'init');
    collie(this, 'load');
    collie(this, 'route');
    collie(this, 'launch');

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
      this._options.dir = process.cwd();
    }

    if (!this._options.configFile) {
      //Service默认配置文件
      this._options.configFile = this._options.id + '.js';
    }
    this.id = this._options.id;
    this.parent = this._options.parent || null;
    this.options = options;
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
    this.alias = this._config.alias || [];

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
   * @returns {Promise}
   */
  async init() {
    debug('%s load', this.id);
    this.init = util.noop;

    let depends = this.dependsIds();
    for (let serviceId of depends) {
      let sub = this.alaska.service(serviceId);
      if (!sub) {
        try {
          let ServiceClass = require(serviceId).default;
          sub = new ServiceClass({}, this.alaska);
        } catch (error) {
          console.error('alaska:service load "%s" failed by %s', serviceId, this.id);
          console.error(error.stack);
          process.exit();
        }
      }
      await sub.init();
    }
  }

  /**
   * 加载
   * @returns {Promise}
   */
  async load() {
    debug('%s load', this.id);
    this.load = util.noop;

    if (this.config('db') !== false) {
      global.__service = this;
      this._models = util.include(this._options.dir + '/models');
    }

    let serivces = this.depends();
    for (let service of serivces) {
      await service.load();
    }
  }

  /**
   * 载入APP中间件
   * @private
   */
  _loadAppMiddlewares() {
    let app = this.alaska.app();
    app.use(function (ctx, next) {
      ctx.alaska = this.alaska;
      return next();
    });
    this.config('appMiddlewares', []).forEach(function (name) {
      let options;
      if (typeof name === 'object') {
        options = name.options;
        name = name.name;
      }
      if (name.startsWith('.')) {
        name = this._options.serviceDir + name;
      }
      let middleware = require(name);
      app.use(middleware(options));
    });
  }

  /**
   * 配置子模块路由
   * @private
   * @returns {Promise}
   */
  async _loadDependsRouter() {
    let depends = this.depends();
    for (let sub of depends) {
      await sub.route();
    }
    return promise;
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
        name = this._options.serviceDir + name;
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
   * 载入REST接口控制器
   * @private
   */
  _loadRestControllers() {
    let router = this.router();

    this._restControllers = this.requireDir(this._options.restDir);
    let rest = require('./rest');
    let bodyParser = require('koa-bodyparser')();

    function restApi(api) {
      return function (ctx, next) {
        if (['show', 'update', 'remove'].indexOf(api) != -1) {
          if (!/^[a-f0-9]{24}$/.test(ctx.params.id)) {
            ctx.status = this.alaska.BAD_REQUEST;
            return;
          }
        }
        let Model = this.model(ctx.params.model);
        if (!Model) {
          //404
          return;
        }
        let id = ctx.params.model.toLowerCase();
        let middlewares = [];

        //Model.rest 方法定义的中间件
        let tmp = Model.restMiddlewares();
        if (tmp[api].length) {
          middlewares = middlewares.concat(tmp[api]);
        }

        // rest 目录下定义的中间件
        if (this._restControllers[id] && this._restControllers[id][api]) {
          middlewares.push(this._restControllers[id][api]);
        }

        // Model.options.rest参数定义的中间件
        if (Model.options.rest && Model.options.rest[api]) {
          middlewares.push(rest[api]);
        }

        if (!middlewares.length) {
          //404
          return;
        }
        ctx.Model = Model;

        return compose(middlewares)(ctx).catch(function (error) {
          console.error(this.id + ' REST API ' + error.stack);
          if (!ctx.body) {
            if (ctx.status === 404) {
              ctx.status = 500;
            }
            ctx.body = {
              error: error.message
            };
          }
        });
      };
    }

    router.get('/rest/:model/count', restApi('count'));
    router.get('/rest/:model/:id', restApi('show'));
    router.get('/rest/:model', restApi('list'));
    router.post('/rest/:model', bodyParser, restApi('create'));
    router.put('/rest/:model/:id', bodyParser, restApi('update'));
    router.del('/rest/:model/:id', restApi('remove'));
  }

  /**
   * 载入控制器
   * @private
   */
  _loadControllers() {
    let router = this.router();

    this._controllers = this.requireDir(this._options.controllersDir);

    _.each(this._controllers, function (ctrl, id) {
      ctrl.__id = id;
      this.emit('register-controller', ctrl);
    });

    router.register('/:controller?/:action?', ['GET', 'POST'], function (ctx, next) {
      let controller = ctx.params.controller || this.config('defaultController');
      let action = ctx.params.action || this.config('defaultAction');
      this.debug('route %s:%s', controller, action);
      if (this._controllers[controller] && this._controllers[controller][action] && action[0] !== '_') {
        return this._controllers[controller][action](ctx, next);
      }
      next();
    });
  }

  /**
   * 配置路由
   * @fires Service#route
   * @returns {Promise}
   */
  async route() {
    debug('route %s', this.id);
    this.route = util.noop;

    let app = this.alaska.app();
    let router = this.router();

    if (this.isMain()) {
      this._loadAppMiddlewares();
    }

    await this._loadDependsRouter();

    this._loadServiceMiddlewares();

    //REST 接口
    if (this.config('rest')) {
      this._loadRestControllers();
    }

    //控制器
    if (this.config('controllers')) {
      this._loadControllers();
    }

    //路由表
    let routes = router.routes();
    //精确匹配域名
    let exact = true;
    //Service域名
    let domain = this.config('domain', '');
    if (domain.startsWith('*.')) {
      domain = domain.substr(2);
      exact = false;
    }
    //如果是主域名,匹配失败后的跳转地址
    let redirect;
    if (this.isMain()) {
      redirect = this.config('redirect', '');
    }

    let service = this;

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
        json.service = ctx.this.toJSON();
        return json;
      };

      return routes(ctx, next);
    });
  }

  /**
   * 启动Service
   * @fires Service#start
   * @returns {Promise}
   */
  async launch() {
    debug('%s start', this.id);
    this.launch = util.noop;

    await this.load();
    await this.route();
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
   * 获取当前Service的依赖的其他Service的名称列表
   * ```
   * let depends = this.depends(); // ['alaska-user','alaska-admin']
   * ```
   * @returns {Array}
   */
  dependsIds() {
    let depends = this.config('depends');
    if (!depends) {
      return [];
    }
    if (typeof depends === 'string') {
      return [depends];
    }
    return depends;
  }

  /**
   * 获取当前Service所依赖的子Service列表
   * @returns {Array}
   */
  depends() {
    let me = this;
    return me.dependsIds().map(function (id) {
      return me.alaska.service(id);
    });
  }

  /**
   * 获取当前Service的父Service列表
   * @returns {Array}
   */
  parents() {
    let parents = [];
    let p = this;
    while (p.parent) {
      parents.push(p.parent);
      p = p.parent;
    }
    return parents;
  }

  /**
   * 输出Service实例JSON调试信息
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      options: this.options,
      config: this._config
    };
  }

  /**
   * 找回此Service下定义的Model
   * @param {string} name 模型名称,例如User或blog.User
   * @param {Boolean} [recursion] 递归查找,如果为true,则查找子Service中定义的Model
   * @returns {Model|null}
   */
  model(name, recursion) {
    let me = this;
    if (me._models[name]) {
      return me._models[name];
    }

    let index = name.indexOf('.');
    if (index > -1) {
      let serviceId = name.substr(0, index);
      name = name.substr(index + 1);
      let service = me.alaska.service(serviceId);
      if (service) {
        return this.model(name);
      }
    }

    if (recursion) {
      let depends = me.depends();
      for (let i in depends) {
        let model = depends[i].model(name, true);
        if (model) {
          return model;
        }
      }
    }

    return null;
  }
}

module.exports = Service;
