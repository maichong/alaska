/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-18
 * @author Liang <liang@maichong.it>
 */

const Koa = require('koa');
const collie = require('collie');
const util = require('./util');

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

  _app = null;
  _services = {};
  util = util;
  noop = util.noop;
  Alaska = Alaska;

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   */
  constructor() {
    debug('constructor');
    collie(this, 'launch');
    collie(this, 'registerService');
    this.Service = require('./service');
    this.Field = require('./field');
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
      require('koa-qs')(this._app)
    }
    return this._app;
  }

  /**
   * 获取所有service
   * @returns {{}}
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
  async launch(options) {
    this.launch = util.noop;
    debug('launch');

    if (!this._main) {
      this._main = new this.Service(options, this);
    }

    await this._main.init();
    await this._main.loadModels();
    await this._main.route();
    await this._main.launch();

    this.app.listen(this.config('port'));
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
   * @param message
   * @param code
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
   * @param {string|number} code
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
