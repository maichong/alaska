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
 * alaska.start('blog').then(function(){
 *     console.log('blog started');
 * });
 *
 * let other = new alaska.Alaska();
 * other.start('shop').then(function(){
 *     console.log('shop started);
 * });
 * ```
 * @extends events.EventEmitter
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

  _loaded = false;
  _routed = false;
  _started = false;
  _app = null;
  noop = util.noop;
  Alaska = Alaska;

  /**
   * 初始化一个新的Alaska实例对象
   * @constructor
   * @fires Alaska#create
   */
  constructor() {
    debug('constructor');
    collie(this, 'launch');
    collie(this, 'registerService');
    //this.Field = require('./field');
    this.Service = require('./service');
    //this.model = require('./model');
    this.defaultAlaska = defaultAlaska ? defaultAlaska : this;
  }

  /**
   * 返回当前koa APP对象
   * @returns {koa.Application}
   */
  app() {
    if (!this._app) {
      this._app = new Koa();
      this._app.name = this.config('name');
      this._app.env = this.config('env');
      this._app.proxy = this.config('proxy');
      this._app.subdomainOffset = this.config('subdomainOffset');
    }
    return this._app;
  }

  /**
   * 获取本Alaska实例中注册的Service
   * @param  {string} id Service ID 或 别名
   * @return {Service|null}
   */
  service(id) {
    let service = this._services[id] || this._serviceAlias[id];

    if (!service) {
      try {
        let ServiceClass = require(id).default;
        service = new ServiceClass({}, this);
      } catch (error) {
        console.error('alaska:service load "%s" failed by %s', service);
        console.error(error.stack);
        process.exit();
      }
    }
    return service;
  }

  /**
   * 注册新的Service
   * @fires Alaska#registerService
   * @param {Service} service Service对象
   */
  registerService(service) {
    if (!this._mainService) {
      this._mainService = service;
    }
    this._services[service.id] = service;
  }

  /**
   * 获取当前Alaska实例的主Service
   * @returns {Service}
   */
  mainService() {
    return this._mainService;
  }

  /**
   * 获取当前Alaska实例的主Service配置
   * @param {string} path 配置名
   * @param {*} [defaultValue] 默认值
   * @returns {*}
   */
  config(path, defaultValue) {
    return this._mainService.config(path, defaultValue);
  }

  /**
   * 定义或者找回此Alaska实例下的Model
   * @param {string} name 模型名称
   * @param {Object} [options] 模型定义
   * @returns {Model|null}
   */
  model(name, options) {
  }

  /**
   * 获取当前主配置的数据库链接
   * @returns {mongoose.Connection | null}
   */
  db() {
    return this._mainService.db();
  }

  /**
   * 启动Alaska实例
   * @fires Alaska#start
   * @param {string|Object} options 默认Service配置信息,此参数将传递给Service的初始化函数
   * @returns {Promise}
   */
  async launch(options) {
    this.launch = util.noop;
    debug('launch');

    if (!this._mainService) {
      this._mainService = new this.Service(options, this);
    }

    await this._mainService.init();
    await this._mainService.load();
    await this._mainService.route();
    await this._mainService.launch();

    this.app().listen(this.config('port'));
  }

  /**
   * 输出Alaska实例JSON调试信息
   * @returns {Object}
   */
  toJSON() {
    return {
      services: Object.keys(this._services)
    };
  }
}

defaultAlaska = new Alaska();
defaultAlaska.default = defaultAlaska;

module.exports = defaultAlaska;
