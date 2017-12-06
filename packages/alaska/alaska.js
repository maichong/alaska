'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OWNER = exports.AUTHENTICATED = exports.PUBLIC = exports.CLOSED = exports.PanicError = exports.NormalError = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaQs = require('koa-qs');

var _koaQs2 = _interopRequireDefault(_koaQs);

var _statuses = require('statuses');

var _statuses2 = _interopRequireDefault(_statuses);

var _collie = require('collie');

var _collie2 = _interopRequireDefault(_collie);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _depd = require('depd');

var _depd2 = _interopRequireDefault(_depd);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $Flow


/* eslint new-cap:0 */

const debug = (0, _debug2.default)('alaska');
const deprecate = (0, _depd2.default)('alaska');

/**
 * 一般错误
 * @class {NormalError}
 */
class NormalError extends Error {

  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

exports.NormalError = NormalError; /**
                                    * 严重错误
                                    * @class {PanicError}
                                    */

class PanicError extends Error {

  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

exports.PanicError = PanicError; /**
                                  * 接口关闭
                                  * @type {number}
                                  */

const CLOSED = exports.CLOSED = 0;

/**
 * 允许所有用户访问接口
 */
const PUBLIC = exports.PUBLIC = 1;

/**
 * 允许已经认证的用户访问接口
 */
const AUTHENTICATED = exports.AUTHENTICATED = 2;

/**
 * 允许资源所有者访问接口
 */
const OWNER = exports.OWNER = 3;

/**
 * Alaska主类,通过import获取Alaska实例对象
 * ```js
 * import alaska from 'alaska';
 * ```
 */
class Alaska {

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   */
  constructor() {
    this._callbackMode = false;
    this._mounts = {};
    this.locales = {};

    this.services = {};
    (0, _collie2.default)(this, 'launch');
    (0, _collie2.default)(this, 'loadMiddlewares');
    (0, _collie2.default)(this, 'registerService');
    (0, _collie2.default)(this, 'listen');
  }

  /**
   * 返回当前koa APP对象
   * @returns {Koa}
   */
  get app() {
    if (!this._app) {
      this._app = new _koa2.default();
      this._app.env = this.getConfig('env');
      this._app.proxy = this.getConfig('proxy');
      this._app.subdomainOffset = this.getConfig('subdomainOffset');
      (0, _koaQs2.default)(this._app);
    }
    return this._app;
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @deprecated
   * @param {string} id Service ID
   * @return {Service|null}
   */
  service(id) {
    deprecate('service()');
    return this.getService(id);
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @since 0.12.0
   * @param {string} id Service ID
   * @return {Service}
   */
  getService(id) {
    if (id === 'main') {
      return this.main;
    }
    let service = this.services[id];
    if (!_lodash2.default.isObject(service)) {
      this.panic(`Can not resolve '${id}' service!`);
    }
    return service;
  }

  /**
   * 判断是否存在指定Service
   * @param {string} id Service ID
   * @returns {boolean}
   */
  hasService(id) {
    if (id === 'main' && this.main) {
      return true;
    }
    return _lodash2.default.isObject(this.services[id]);
  }

  /**
   * 注册新的Service
   * @param {Service} service Service对象
   */
  registerService(service) {
    if (!this.main) {
      this.main = service;
    }
    this.services[service.id] = service;
  }

  /**
   * 获取当前Alaska实例的主Service配置
   * @deprecated
   * @param {string} key 配置名
   * @param {*} [defaultValue] 默认值
   * @returns {*}
   */
  config(key, defaultValue) {
    deprecate('config()');
    return this.getConfig(key, defaultValue);
  }

  /**
   * 获取当前Alaska实例的主Service配置
   * @since 0.12.0
   * @param {string} key 配置名
   * @param {*} [defaultValue] 默认值
   * @returns {*}
   */
  getConfig(key, defaultValue) {
    return this.main.getConfig(key, defaultValue);
  }

  /**
   * 获取当前主配置的数据库链接
   * @returns {mongoose.Connection | null}
   */
  get db() {
    return this.main.db;
  }

  /**
   * 监听
   */
  async listen() {
    // $Flow
    this.listen = utils.resolved;
    const alaska = this;
    debug('listen');
    const mountKeys = Object.keys(this._mounts);

    this.app.use(async (ctx, next) => {
      const { hostname } = ctx;
      for (let point of mountKeys) {
        debug('test endpoint', point);
        let service = alaska._mounts[point];
        if (!service.domain || service.domain === hostname) {
          if (ctx.path.startsWith(service.prefix)) {
            ctx.service = service;
            await service.routes(ctx, next);
            return;
          }
          if (ctx.path + '/' === service.prefix) {
            ctx.redirect(service.prefix);
            return;
          }
        }
      }
    });

    if (!this._callbackMode) {
      this.app.listen(this.getConfig('port'));
    }
  }

  /**
   * 返回 http.createServer() 回调函数
   * @returns {Function}
   */
  callback() {
    this._callbackMode = true;
    return this.app.callback();
  }

  /**
   * 加载APP中间件
   */
  async loadMiddlewares() {
    // $Flow
    this.loadMiddlewares = utils.resolved;
    // $Flow
    const alaska = this;
    const MAIN = this.main;
    const { app } = this;

    const locales = this.getConfig('locales');
    const localeCookieKey = this.getConfig('localeCookieKey');
    const localeQueryKey = this.getConfig('localeQueryKey');
    const defaultLocale = MAIN.getConfig('defaultLocale');
    // $Flow
    app.use((ctx, next) => {
      ctx.set('X-Powered-By', 'Alaska');
      ctx.alaska = alaska;
      ctx.main = MAIN;
      ctx.service = MAIN;
      ctx.panic = alaska.panic;
      ctx.error = alaska.error;

      /**
       * 发送文件
       * @param {string} filePath
       * @param {Object} options
       */
      ctx.sendfile = async function (filePath, options) {
        options = options || {};
        let trailingSlash = filePath[filePath.length - 1] === '/';
        let { index } = options;
        if (index && trailingSlash) filePath += index;
        let maxage = options.maxage || options.maxAge || 0;
        let hidden = options.hidden || false;
        if (!hidden && utils.isHidden(filePath)) return;

        let stats;
        try {
          stats = await utils.statAsync(filePath);
          if (stats.isDirectory()) {
            if (index) {
              filePath += '/' + index;
              stats = await utils.statAsync(filePath);
            } else {
              return;
            }
          }
        } catch (err) {
          let notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
          if (notfound.indexOf(err.code) > -1) return;
          err.status = 500;
          throw err;
        }
        ctx.set('Last-Modified', stats.mtime.toUTCString());
        let lastModified = ctx.headers['if-modified-since'];
        if (lastModified) {
          try {
            let date = new Date(lastModified);
            if (date.getTime() === stats.mtime.getTime()) {
              ctx.status = 304;
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        ctx.set('Content-Length', stats.size);
        ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 || 0));
        ctx.type = options.type || _mimeTypes2.default.lookup(filePath);
        ctx.body = _fs2.default.createReadStream(filePath);
      };

      //toJSON
      {
        let { toJSON } = ctx;
        ctx.toJSON = function () {
          let json = toJSON.call(ctx);
          json.session = ctx.session || null;
          json.state = ctx.state;
          json.alaska = ctx.alaska.toJSON();
          json.service = ctx.service.toJSON();
          return json;
        };
      }

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
      // $Flow
      Object.defineProperty(ctx, 'locale', {
        get: () => {
          let locale = ctx._locale;
          if (locale) {
            return locale;
          }
          locale = ctx.cookies.get(localeCookieKey) || '';
          if (!locale || locales.indexOf(locale) < 0) {
            //没有cookie设置
            //自动判断
            locale = defaultLocale;
            let languages = utils.parseAcceptLanguage(ctx.get('accept-language'));
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
        }
      });

      //translate
      /**
       * 翻译
       * @param {string} message 原文
       * @param {string} [locale] 目标语言
       * @param {Object} [values] 翻译值
       * @returns {string} 返回翻译结果
       */
      ctx.t = (message, locale, values) => {
        if (locale && typeof locale === 'object') {
          values = locale;
          locale = null;
        }
        if (!locale) {
          // eslint-disable-next-line prefer-destructuring
          locale = ctx.locale;
        }
        return ctx.service.t(message, locale, values);
      };
      ctx.state.t = ctx.t;

      //config
      ctx.state.c = (a, b, c) => ctx.service.getConfig(a, b, c);

      //env
      ctx.state.env = process.env.NODE_ENV || 'production';

      /**
       * 渲染并显示模板
       * @param {string} template 模板文件
       * @param {Object} [state]  模板变量
       * @returns {Promise<string>} 返回渲染结果
       */
      ctx.show = function (template, state) {
        return ctx.service.renderer.renderFile(template, Object.assign({}, ctx.state, state)).then(html => {
          ctx.body = html;
          return Promise.resolve(html);
        });
      };

      return next();
    });

    // $Flow
    _lodash2.default.map(this.getConfig('middlewares', {}), (item, id) => {
      if (!item.id) {
        item.id = id;
      }
      return item;
    }).sort((a, b) => a.sort < b.sort).forEach(item => {
      let { id, fn, options } = item;
      if (fn && typeof fn.default === 'function') {
        fn = fn.default;
      }
      let name = id || (fn ? fn.name : 'unknown');
      debug('middleware', name);

      if (!_lodash2.default.isFunction(fn)) {
        fn = this.modules.middlewares[id];
        if (!fn) {
          throw new PanicError(`Middleware '${name}' not found!`);
        }
        if (_lodash2.default.isObject(fn) && _lodash2.default.isFunction(fn.default)) {
          fn = fn.default;
        }
      }
      if (!options) {
        options = {};
      }
      if (id) {
        let defaultOptions = this.getConfig(id);
        if (_lodash2.default.isObject(defaultOptions)) {
          options = utils.merge(_lodash2.default.cloneDeep(defaultOptions), options);
        }
      }
      if (typeof fn === 'function') {
        app.use(fn(options));
      } else {
        throw new PanicError(`Middleware '${name}' is invalid!`);
      }
    });
  }

  /**
   * 输出Alaska实例JSON调试信息
   * @returns {Object}
   */
  toJSON() {
    return Object.keys(this.services).reduce((res, key) => {
      res[key] = this.services[key].toJSON();
      return res;
    }, {});
  }

  /**
   * 抛出严重错误,并输出调用栈
   * @param {string|number|Error} message
   * @param {string|number} [code]
   */
  panic(message, code) {
    if (!code && typeof message === 'number') {
      let msg = _statuses2.default[message];
      if (msg) {
        code = message;
        message = msg;
      }
    }
    // $Flow 我们知道message为字符串，但是flow不知道
    let error = new PanicError(message);
    if (code) {
      error.code = code;
    }
    console.error('Panic ' + error.stack);
    throw error;
  }

  /**
   * 抛出普通异常
   * @param {string|number|Error} message
   * @param {string|number} [code]
   */
  error(message, code) {
    if (!code && typeof message === 'number') {
      let msg = _statuses2.default[message];
      if (msg) {
        code = message;
        message = msg;
      }
    }
    // $Flow 我们知道message为字符串，但是flow不知道
    let error = new NormalError(message);
    if (code) {
      error.code = code;
    }
    throw error;
  }
}

exports.default = new Alaska();


exports.utils = utils;
exports.Field = require('./field').default;
exports.Model = require('./model').default;
exports.Sled = require('./sled').default;
exports.Service = require('./service').default;
exports.Renderer = require('./renderer').default;
exports.Driver = require('./driver').default;