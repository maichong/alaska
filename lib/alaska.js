'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _collie = require('collie');

var _collie2 = _interopRequireDefault(_collie);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _field = require('./field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-01-18
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

const debug = require('debug')('alaska');
let defaultAlaska;

/**
 * Alaska主类,一个项目运行时可以实例化多个Alaska对象,每个Alaska对象会监听一个端口
 * 默认情况下通过 `require('alaska')` 获取默认Alaska实例
 * ```javascript
 * const alaska = require('alaska');
 *
 * alaska.launch('blog').then(function(){
 *     console.log('blog launched');
 * });
 *
 * let other = new alaska.Alaska();
 * other.launch('shop').then(function(){
 *     console.log('shop launched);
 * });
 * ```
 */
class Alaska {

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   */


  /**
   * 允许资源所有者访问接口
   */


  /**
   * 允许所有用户访问接口
   */


  /**
   * HTTP状态码422 REST接口create/update数据验证失败
   */


  /**
   * HTTP状态码404 REST接口show/list请求的资源不存在
   */


  /**
   * HTTP状态码401 REST接口未授权
   */


  /**
   * HTTP状态码204 REST接口remove成功
   */


  /**
   * HTTP状态码200 REST接口show/list方法成功
   */
  constructor() {
    this.OK = 200;
    this.CREATED = 201;
    this.NO_CONTENT = 204;
    this.BAD_REQUEST = 400;
    this.UNAUTHORIZED = 401;
    this.FORBIDDEN = 403;
    this.NOT_FOUND = 404;
    this.METHOD_NOT_ALLOWED = 405;
    this.UNPROCESSABLE_ENTITY = 422;
    this.CLOSED = 0;
    this.PUBLIC = 1;
    this.AUTHENTICATED = 2;
    this.OWNER = 3;
    this._app = null;
    this._services = {};
    this._mounts = {};
    this.util = util;
    this.Alaska = Alaska;
    this.Service = _service2.default;
    this.Field = _field2.default;

    (0, _collie2.default)(this, 'launch');
    (0, _collie2.default)(this, 'loadMiddlewares');
    (0, _collie2.default)(this, 'registerService');
    (0, _collie2.default)(this, 'listen');
    this.defaultAlaska = defaultAlaska ? defaultAlaska : this;
  }

  /**
   * 返回当前koa APP对象
   * @returns {koa.Application}
   */


  /**
   * 允许已经认证的用户访问接口
   */


  /**
   * 接口关闭
   * @type {number}
   */


  /**
   * HTTP状态码405 REST接口HTTP方法不允许
   */


  /**
   * HTTP状态码403 REST已授权,但是没有权限
   */


  /**
   * HTTP状态码400 REST接口create/update请求未识别,错误的请求
   */


  /**
   * HTTP状态码201 REST接口create/update成功
   */
  get app() {
    if (!this._app) {
      this._app = new _koa2.default();
      this._app.name = this.config('name');
      this._app.env = this.config('env');
      this._app.proxy = this.config('proxy');
      this._app.subdomainOffset = this.config('subdomainOffset');
      require('koa-qs')(this._app);
    }
    return this._app;
  }

  /**
   * 获取所有service
   * @returns {Object}
   */
  get services() {
    return this._services;
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @param  {string} id Service ID 或 别名
   * @return {Service|null}
   */
  service(id) {
    let service = this._services[id];

    if (!service) {
      try {
        let ServiceClass = require(id).default;
        service = new ServiceClass({}, this);
      } catch (error) {
        console.error('Load service "%s" failed', id);
        console.error(error.stack);
        process.exit();
      }
    }
    return service;
  }

  /**
   * 注册新的Service
   * @param {Service} service Service对象
   */
  registerService(service) {
    if (!this._main) {
      this._main = service;
    }
    this._services[service.id] = service;
  }

  /**
   * 获取当前Alaska实例的主Service
   * @returns {Service}
   */
  get main() {
    return this._main;
  }

  /**
   * 获取当前Alaska实例的主Service配置
   * @param {string} path 配置名
   * @param {*} [defaultValue] 默认值
   * @returns {*}
   */
  config(path, defaultValue) {
    return this._main.config(path, defaultValue);
  }

  /**
   * 获取当前主配置的数据库链接
   * @returns {mongoose.Connection | null}
   */
  get db() {
    return this._main.db;
  }

  /**
   * [async]启动Alaska实例
   * @param {string|Object} options 默认Service配置信息,此参数将传递给Service的初始化函数
   */
  launch(options) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.launch = util.resolved;
      debug('launch');

      if (!_this._main) {
        _this._main = new _this.Service(options, _this);
      }

      yield _this._main.launch();
    })();
  }

  /**
   * [async] 监听
   */
  listen() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.launch = util.resolved;
      const alaska = _this2;
      debug('listen');
      _this2.app.use(function (ctx, next) {
        const hostname = ctx.hostname;
        //test
        for (let point in alaska._mounts) {
          debug('test', point);
          let service = alaska._mounts[point];
          if (service.domain && service.domain !== hostname) {
            continue;
          }
          if (ctx.path.startsWith(service.prefix)) {
            ctx.service = service;
            return service.routes(ctx, next);
          }
        }
        //TODO 404
      });
      _this2.app.listen(_this2.config('port'));
    })();
  }

  /**
   * 加载APP中间件
   */
  loadMiddlewares() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.loadMiddlewares = util.resolved;
      const alaska = _this3;
      const MAIN = _this3.main;
      const app = _this3.app;

      const locales = _this3.config('locales');
      const localeCookieKey = _this3.config('localeCookieKey');
      const localeQueryKey = _this3.config('localeQueryKey');
      const defaultLocale = MAIN.config('defaultLocale');
      app.use(function (ctx, next) {
        ctx.set('X-Powered-By', 'Alaska');
        ctx.alaska = alaska;
        ctx.main = MAIN;
        ctx.service = MAIN;

        /**
         * 发送文件
         * @param {string} filePath
         * @param {Object} options
         */
        ctx.sendfile = (() => {
          var ref = _asyncToGenerator(function* (filePath, options) {
            options = options || {};
            let trailingSlash = '/' === filePath[filePath.length - 1];
            let index = options.index;
            if (index && trailingSlash) filePath += index;
            let maxage = options.maxage || options.maxAge || 0;
            let hidden = options.hidden || false;
            if (!hidden && util.isHidden(filePath)) return;

            let stats;
            try {
              stats = yield _fs2.default.stat(filePath);
              if (stats.isDirectory()) {
                if (index) {
                  filePath += '/' + index;
                  stats = yield _fs2.default.stat(filePath);
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
            ctx.type = options.type || _mime2.default.lookup(filePath);
            ctx.body = _fs2.default.createReadStream(filePath);
          });

          return function (_x, _x2) {
            return ref.apply(this, arguments);
          };
        })();

        //toJSON
        {
          let toJSON = ctx.toJSON;
          ctx.toJSON = function () {
            let json = toJSON.call(ctx);
            json.alaska = ctx.alaska.toJSON();
            json.service = ctx.service.toJSON();
            return json;
          };
        }

        //locale
        {
          //切换语言
          if (localeQueryKey) {
            if (ctx.query[localeQueryKey]) {
              let locale = ctx.query[localeQueryKey];
              if (locales.indexOf(locale) > -1) {
                ctx._locale = locale;
                ctx.cookies.set(localeCookieKey, locale, {
                  maxAge: 365 * 86400 * 1000
                });
              }
            }
          }
          ctx.__defineGetter__('locale', function () {
            let locale = ctx._locale;
            if (locale) {
              return locale;
            }
            locale = ctx.cookies.get(localeCookieKey) || '';
            if (!locale || locales.indexOf(locale) < 0) {
              //没有cookie设置
              //自动判断
              locale = defaultLocale;
              let languages = util.pareseAcceptLanguage(ctx.get('accept-language'));
              for (let lang of languages) {
                if (locales.indexOf(lang) > -1) {
                  locale = lang;
                  break;
                }
              }
              if (locale) {
                ctx._locale = locale;
              }
            }
            return locale;
          });
        }

        //translate
        {
          ctx.t = function (message, locale, values) {
            if (locale && typeof locale === 'object') {
              values = locale;
              locale = null;
            }
            if (!locale) {
              locale = ctx.locale;
            }
            return ctx.service.t(message, locale, values);
          };

          ctx.locals = {
            t: ctx.t
          };
        }

        //render
        {
          ctx.render = function (template, locals) {
            const service = ctx.service;
            const templatesDir = _path2.default.join(service.dir, service.config('templates')) + '/';
            let file = templatesDir + template;
            if (!util.isFile(file)) {
              throw new Error(`Template is not exist: ${ file }`);
            }
            return new Promise(function (resolve, reject) {
              service.engine.renderFile(file, _lodash2.default.assign({}, ctx.locals, locals), function (error, result) {
                if (error) {
                  reject(error);
                  return;
                }
                resolve(result);
              });
            });
          };

          ctx.show = (() => {
            var ref = _asyncToGenerator(function* (template, locals) {
              ctx.body = yield ctx.render(template, locals);
            });

            return function (_x3, _x4) {
              return ref.apply(this, arguments);
            };
          })();
        }

        return next();
      });

      let _middlewares = {};
      _this3.config('appMiddlewares', []).map(function (id) {
        if (typeof id === 'function') {
          //数组中直接就是一个中间件函数
          return {
            fn: id,
            sort: id.sort || 0,
            id: id.name || Math.random(),
            name: id.name || '-'
          };
        }
        let options;
        let sort = 0;
        if (typeof id === 'object') {
          options = id.options;
          sort = id.sort || 0;
          id = id.id;
        }
        if (id.startsWith('.')) {
          //如果是一个文件路径
          id = _path2.default.join(service.dir, id);
        }
        return {
          id,
          sort,
          options
        };
      }).filter(function (item) {
        if (_middlewares[item.id]) {
          return false;
        }
        _middlewares[item.id] = item;
        return true;
      }).sort(function (a, b) {
        return a.sort < b.sort;
      }).forEach(function (item) {
        debug('middleware', item.name || item.id);
        if (item.fn) {
          app.use(item.fn);
        } else {
          let middleware = require(item.id);
          if (middleware.default) {
            middleware = middleware.default;
          }
          app.use(middleware(item.options));
        }
      });
    })();
  }

  /**
   * 输出Alaska实例JSON调试信息
   * @returns {object}
   */
  toJSON() {
    return {
      services: Object.keys(this._services)
    };
  }

  /**
   * 抛出严重错误,并输出调用栈
   * @param {string|Error} message
   * @param {string|number} [code]
   */
  panic(message, code) {
    let error = new defaultAlaska.PanicError(message);
    if (code) {
      error.code = code;
    }
    console.error('Panic ' + error.stack);
    throw error;
  }

  /**
   * 抛出普通异常
   * @param {string|Error} message
   * @param {string|number} [code]
   */
  error(message, code) {
    let error = new defaultAlaska.NormalError(message);
    if (code) {
      error.code = code;
    }
    throw error;
  }

  /**
   * [async]执行一个异步任务,如果失败则抛出NormalError
   * @param {Promise} promise
   * @returns {*}
   */
  try(promise) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      try {
        return yield promise;
      } catch (error) {
        if (error instanceof TypeError || error instanceof SyntaxError || error instanceof ReferenceError) {
          throw error;
        } else {
          _this4.error(error);
        }
      }
    })();
  }
}

defaultAlaska = new Alaska();
defaultAlaska.default = defaultAlaska;

/**
 * 一般错误
 * @class {NormalError}
 */
defaultAlaska.NormalError = class NormalError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

/**
 * 严重错误
 * @class {PanicError}
 */
defaultAlaska.PanicError = class PanicError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
};

module.exports = defaultAlaska;