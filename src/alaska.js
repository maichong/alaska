/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-18
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import path from 'path';
import fs from 'mz/fs';
import mime from 'mime';
import Koa from 'koa';
import statuses from 'statuses';
import collie from 'collie';
import * as util from './util';
import Service from './service';
import Field from './field';

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
   * HTTP状态码200 REST接口show/list方法成功
   */
  OK = 200;

  /**
   * HTTP状态码201 REST接口create/update成功
   */
  CREATED = 201;

  /**
   * HTTP状态码204 REST接口remove成功
   */
  NO_CONTENT = 204;

  /**
   * HTTP状态码400 REST接口create/update请求未识别,错误的请求
   */
  BAD_REQUEST = 400;

  /**
   * HTTP状态码401 REST接口未授权
   */
  UNAUTHORIZED = 401;

  /**
   * HTTP状态码403 REST已授权,但是没有权限
   */
  FORBIDDEN = 403;

  /**
   * HTTP状态码404 REST接口show/list请求的资源不存在
   */
  NOT_FOUND = 404;

  /**
   * HTTP状态码405 REST接口HTTP方法不允许
   */
  METHOD_NOT_ALLOWED = 405;

  /**
   * HTTP状态码422 REST接口create/update数据验证失败
   */
  UNPROCESSABLE_ENTITY = 422;

  /**
   * 接口关闭
   * @type {number}
   */
  CLOSED = 0;

  /**
   * 允许所有用户访问接口
   */
  PUBLIC = 1;

  /**
   * 允许已经认证的用户访问接口
   */
  AUTHENTICATED = 2;

  /**
   * 允许资源所有者访问接口
   */
  OWNER = 3;

  _callbackMode = false;
  _app = null;
  _services = {};
  _mounts = {};
  locales = {};
  util = util;
  Alaska = Alaska;
  Service = Service;
  Field = Field;

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   */
  constructor() {
    collie(this, 'launch');
    collie(this, 'loadMiddlewares');
    collie(this, 'registerService');
    collie(this, 'listen');
    this.defaultAlaska = defaultAlaska ? defaultAlaska : this;
  }

  /**
   * 返回当前koa APP对象
   * @returns {koa.Application}
   */
  get app() {
    if (!this._app) {
      this._app = new Koa();
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
   * @param {string} id Service ID 或 别名
   * @param {boolean} [optional] 可选,默认false,如果为true则不会主动加载,并且未找到时不抛出异常
   * @return {Service|null}
   */
  service(id, optional) {
    let service = this._services[id];

    if (!service && optional) {
      return null;
    }

    if (!service) {
      try {
        let ServiceClass = require(id).default;
        service = new ServiceClass({}, this);
      } catch (error) {
        console.error('Load service "%s" failed', id);
        console.error(error.stack);
        process.exit(1);
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
  async launch(options) {
    this.launch = util.resolved;
    debug('launch');

    if (!this._main) {
      this._main = new this.Service(options, this);
    }

    await this._main.launch();
  }

  /**
   * [async] 监听
   */
  async listen() {
    this.launch = util.resolved;
    const alaska = this;
    debug('listen');
    this.app.use(function (ctx, next) {
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
        if (ctx.path + '/' === service.prefix) {
          return ctx.redirect(service.prefix);
        }
      }
    });
    if (!this._callbackMode) {
      this.app.listen(this.config('port'));
    }
  }

  callback() {
    this._callbackMode = true;
    return this.app.callback();
  }

  /**
   * 加载APP中间件
   */
  async loadMiddlewares() {
    this.loadMiddlewares = util.resolved;
    const alaska = this;
    const MAIN = this.main;
    const app = this.app;

    const locales = this.config('locales');
    const localeCookieKey = this.config('localeCookieKey');
    const localeQueryKey = this.config('localeQueryKey');
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
      ctx.sendfile = async function (filePath, options) {
        options = options || {};
        let trailingSlash = '/' === filePath[filePath.length - 1];
        let index = options.index;
        if (index && trailingSlash) filePath += index;
        let maxage = options.maxage || options.maxAge || 0;
        let hidden = options.hidden || false;
        if (!hidden && util.isHidden(filePath)) return;

        let stats;
        try {
          stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            if (index) {
              filePath += '/' + index;
              stats = await fs.stat(filePath);
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
      };

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
        ctx.__defineGetter__('locale', () => {
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
        /**
         * 翻译
         * @param {string} message 原文
         * @param {string} [locale] 目标语言
         * @param {object} [values] 翻译值
         * @returns {string} 返回翻译结果
         */
        ctx.t = (message, locale, values) => {
          if (locale && typeof locale === 'object') {
            values = locale;
            locale = null;
          }
          if (!locale) {
            locale = ctx.locale;
          }
          return ctx.service.t(message, locale, values);
        };

        ctx.state.t = ctx.t;
      }

      //config
      ctx.state.c = (a, b, c) => ctx.service.config(a, b, c);

      //env
      ctx.state.env = process.env.NODE_ENV;

      //render
      {
        /**
         * [async] 渲染模板
         * @param {string} template 模板文件
         * @param {Object} [state]  模板变量
         * @returns {string} 返回渲染结果
         */
        ctx.render = function (template, state) {
          const service = ctx.service;
          //const templatesDir = path.join(service.dir, service.config('templates')) + '/';
          //let file = templatesDir + template;
          //if (!util.isFile(file)) {
          //  throw new Error(`Template is not exist: ${file}`);
          //}
          return new Promise((resolve, reject) => {
            service.engine.renderFile(template, _.assign({}, ctx.state, state), (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            });
          });
        };

        /**
         * [async] 渲染并显示模板
         * @param {string} template 模板文件
         * @param {Object} [state]  模板变量
         * @returns {string} 返回渲染结果
         */
        ctx.show = function (template, state) {
          return ctx.render(template, state).then(html => {
            ctx.body = html;
            return html;
          });
        };
      }

      return next();
    });

    let _middlewares = {};
    this.config('appMiddlewares', []).map(id => {
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
        id = path.join(service.dir, id);
      }
      return {
        id,
        sort,
        options
      };
    }).filter(item => {
      if (_middlewares[item.id]) {
        return false;
      }
      _middlewares[item.id] = item;
      return true;
    }).sort((a, b) => a.sort < b.sort).forEach(item => {
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
    if (!code && Number.isInteger(message)) {
      let msg = statuses[message];
      if (msg) {
        code = message;
        message = msg;
      }
    }
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
    if (!code && Number.isInteger(message)) {
      let msg = statuses[message];
      if (msg) {
        code = message;
        message = msg;
      }
    }
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
  async try(promise) {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof TypeError || error instanceof SyntaxError || error instanceof ReferenceError) {
        throw error;
      } else {
        this.error(error);
      }
    }
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
