// @flow

/* eslint new-cap:0 */

import fs from 'fs';
import _ from 'lodash';
import mime from 'mime-types';
import Koa from 'koa';
// $Flow
import KoaQS from 'koa-qs';
import statuses from 'statuses';
import collie from 'collie';
import Debugger from 'debug';
import depd from 'depd';
import * as utils from './utils';

const debug = Debugger('alaska');
const deprecate = depd('alaska');

/**
 * 一般错误
 * @class {NormalError}
 */
export class NormalError extends Error {
  code: number | void;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

/**
 * 严重错误
 * @class {PanicError}
 */
export class PanicError extends Error {
  code: number | void;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

/**
 * 接口关闭
 * @type {number}
 */
export const CLOSED = 0;

/**
 * 允许所有用户访问接口
 */
export const PUBLIC = 1;

/**
 * 允许已经认证的用户访问接口
 */
export const AUTHENTICATED = 2;

/**
 * 允许资源所有者访问接口
 */
export const OWNER = 3;

/**
 * Alaska主类,通过import获取Alaska实例对象
 * ```js
 * import alaska from 'alaska';
 * ```
 */
class Alaska {
  _callbackMode = false;
  _app: Koa;
  modules: Object;
  main: Alaska$Service;
  services: {
    [id: string]: Alaska$Service
  };
  _mounts = {};
  locales = {};

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   */
  constructor() {
    this.services = {};
    collie(this, 'launch');
    collie(this, 'loadMiddlewares');
    collie(this, 'registerService');
    collie(this, 'listen');
  }

  /**
   * 返回当前koa APP对象
   * @returns {Koa}
   */
  get app(): Koa {
    if (!this._app) {
      this._app = new Koa();
      this._app.env = this.getConfig('env');
      this._app.proxy = this.getConfig('proxy');
      this._app.subdomainOffset = this.getConfig('subdomainOffset');
      KoaQS(this._app);
    }
    return this._app;
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @deprecated
   * @param {string} id Service ID
   * @return {Service|null}
   */
  service(id: string): Alaska$Service {
    deprecate('service()');
    return this.getService(id);
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @since 0.12.0
   * @param {string} id Service ID
   * @return {Service}
   */
  getService(id: string): Alaska$Service {
    if (id === 'main') {
      return this.main;
    }
    let service = this.services[id];
    if (!_.isObject(service)) {
      this.panic(`Can not resolve '${id}' service!`);
    }
    return service;
  }

  /**
   * 判断是否存在指定Service
   * @param {string} id Service ID
   * @returns {boolean}
   */
  hasService(id: string): boolean {
    if (id === 'main' && this.main) {
      return true;
    }
    return _.isObject(this.services[id]);
  }

  /**
   * 注册新的Service
   * @param {Service} service Service对象
   */
  registerService(service: Alaska$Service) {
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
  config(key: string, defaultValue: any): any {
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
  getConfig(key: string, defaultValue: any): any {
    return this.main.getConfig(key, defaultValue);
  }

  /**
   * 获取当前主配置的数据库链接
   * @returns {mongoose.Connection | null}
   */
  get db(): Mongoose$Connection {
    return this.main.db;
  }

  /**
   * 监听
   */
  async listen(): Promise<void> {
    // $Flow
    this.listen = utils.resolved;
    const alaska = this;
    debug('listen');
    const mountKeys = Object.keys(this._mounts);

    this.app.use(async(ctx, next) => {
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
  callback(): (req: http$IncomingMessage, res: http$ServerResponse) => void {
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
    const alaska: Alaska$Alaska = this;
    const MAIN = this.main;
    const { app } = this;

    const locales = this.getConfig('locales');
    const localeCookieKey = this.getConfig('localeCookieKey');
    const localeQueryKey = this.getConfig('localeQueryKey');
    const defaultLocale = MAIN.getConfig('defaultLocale');
    // $Flow
    app.use(async(ctx: Alaska$Context, next) => {
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
        ctx.type = options.type || mime.lookup(filePath);
        ctx.body = fs.createReadStream(filePath);
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
      ctx.show = async function (template: string, state?: Object): Promise<string> {
        ctx.body = await ctx.service.renderer.renderFile(template, Object.assign({}, ctx.state, state));
        return ctx.body;
      };

      await next();
    });

    // $Flow
    _.map(this.getConfig('middlewares', {}), (item, id) => {
      if (!item.id) {
        item.id = id;
      }
      return item;
    })
      .sort((a, b) => a.sort < b.sort)
      .forEach((item: Alaska$Config$middleware) => {
        let { id, fn, options } = item;
        if (fn && typeof fn.default === 'function') {
          fn = fn.default;
        }
        let name = id || (fn ? fn.name : 'unknown');
        debug('middleware', name);

        if (!_.isFunction(fn)) {
          fn = this.modules.middlewares[id];
          if (!fn) {
            throw new PanicError(`Middleware '${name}' not found!`);
          }
          if (_.isObject(fn) && _.isFunction(fn.default)) {
            fn = fn.default;
          }
        }
        if (!options) {
          options = {};
        }
        if (id) {
          let defaultOptions = this.getConfig(id);
          if (_.isObject(defaultOptions)) {
            options = utils.merge(_.cloneDeep(defaultOptions), options);
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
  toJSON(): Object {
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
  panic(message: string | number, code?: number) {
    if (!code && typeof message === 'number') {
      let msg = statuses[message];
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
  error(message: string | number, code?: number) {
    if (!code && typeof message === 'number') {
      let msg = statuses[message];
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

export default new Alaska();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error.stack || error);
  let alaska = module.exports.defualt;
  if (alaska && alaska.main && alaska.main.getConfig('unhandledRejectionExit') === false) {
    return;
  }
  process.exit(1);
});

exports.utils = utils;
exports.Field = require('./field').default;
exports.Model = require('./model').default;
exports.Sled = require('./sled').default;
exports.Service = require('./service').default;
exports.Renderer = require('./renderer').default;
exports.Driver = require('./driver').default;
