'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collie = require('collie');

var _collie2 = _interopRequireDefault(_collie);

var _stringRandom = require('string-random');

var _stringRandom2 = _interopRequireDefault(_stringRandom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-03-27
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

class Sled {

  /**
   * Sled构造函数
   * @param {Object} [data]
   */
  constructor(data) {
    this.data = data || {};
    //队列item数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.item = null;
    //队列缓存扩展信息数据,只有从队列中读取的Sled或将Sled发送到队列后才有此属性
    this.payload = null;
    //执行结果
    this.result = null;
    //错误
    this.error = null;
  }

  /**
   * 获取sled所属service
   * @returns {Service}
   */
  get service() {
    return this.constructor.service;
  }

  /**
   * 获取Sled name
   * @returns {string}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * 获取Sled key
   * @returns {string}
   */
  get key() {
    return this.constructor.key;
  }

  /**
   * 获取sled配置
   * @private
   * @returns {Object}
   */
  get config() {
    return this.constructor.config;
  }

  /**
   * 获取缓存驱动
   * @private
   * @returns {RedisCacheDriver|boolean}
   */
  createCacheDriver() {
    return this.constructor.createCacheDriver();
  }

  /**
   * 获取队列驱动
   * @private
   * @returns {RedisQueueDriver}
   */
  createQueueDriver() {
    return this.constructor.createQueueDriver();
  }

  /**
   * 获取队列驱动
   * @private
   * @returns {RedisSubscribeDriver}
   */
  createSubscribeDriver(id) {
    return this.constructor.createSubscribeDriver(id);
  }

  /**
   * 注册 Sled 前置钩子
   * @param fn
   */
  static pre(fn) {
    if (!this._pre) {
      this._pre = [];
    }
    this._pre.push(fn);
  }

  /**
   * 注册 Sled 后置钩子
   * @param fn
   */
  static post(fn) {
    if (!this._post) {
      this._post = [];
    }
    this._post.push(fn);
  }

  /**
   * 获取Sled设置
   * @private
   * @returns {Object}
   */
  static get config() {
    if (!this._config) {
      let service = this.service;
      let key = this.key;
      let name = 'sled.' + key;
      let config = service.config(true, name);
      if (!config) {
        config = service.config(true, 'sled');
      }
      this._config = config;
    }
    if (!this._config) {
      throw new ReferenceError('sled config not found');
    }
    return this._config;
  }

  /**
   * 获取Sled数据缓存驱动
   * @private
   * @returns {RedisCacheDriver|boolean}
   */
  static createCacheDriver() {
    if (!this._cache && this._cache !== false) {
      let config = this.config;
      let cache = false;
      if (config.cache) {
        let CacheDriver = require(config.cache.type);
        cache = new CacheDriver(config.cache);
      }
      this._cache = cache;
    }
    return this._cache;
  }

  /**
   * 获取Sled队列驱动
   * @private
   * @returns {RedisQueueDriver}
   */
  static createQueueDriver() {
    let config = this.config;
    if (!config.queue) {
      throw new ReferenceError('sled queue config not found');
    }
    let QueueDriver = require(config.queue.type);
    return new QueueDriver(this.key, config.queue);
  }

  /**
   * 获取Sled订阅驱动
   * @private
   * @returns {RedisSubscribeDriver}
   */
  static createSubscribeDriver(id) {
    let config = this.config;
    if (!config.subscribe) {
      throw new ReferenceError('sled subscribe config not found');
    }
    let SubscribeDriver = require(config.subscribe.type);
    return new SubscribeDriver(id, config.subscribe);
  }

  /**
   * [async] alias for sled.run()
   * @param {Object} [data]
   * @returns {*}
   */
  static run(data) {
    let sled = new this(data);
    return sled.run();
  }

  /**
   * 从队列中读取一个sled
   * @param {number} [timeout] 读取超时,单位秒,默认Infinity
   */
  static read(timeout) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let queue = _this.createQueueDriver();
      let item = yield queue.pop(timeout);
      if (!item) {
        return null;
      }
      let payload = item.payload;
      if (!payload) {
        let cache = _this.createCacheDriver();
        if (cache) {
          payload = yield cache.get(item.id);
        }
      }
      let sled = new _this();
      if (sled.fromJSON) {
        sled.fromJSON(payload.data);
      } else {
        sled.data = payload.data;
      }
      if (payload.result !== undefined) {
        sled.result = payload.result;
      } else if (payload.error) {
        sled.error = new Error(payload.error);
      }
      sled.payload = payload;
      sled.fromQueue = true;
      sled.item = item;
      sled.id = item.id;
      return sled;
    })();
  }

  /**
   * 将sled发送到队列
   * @param {number} [timeout] Sled超时时间,单位秒,默认60天
   * @param {boolean} [notify] Sled执行后是否需要通知,默认false
   */
  send(timeout, notify) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.result || _this2.error) {
        throw new Error('can not send a finished sled');
      }
      //如果已经有item属性,代表已经发送到队列,或者是从队列中读取的sled
      if (_this2.item) {
        return _this2.item;
      }
      //默认60天超时
      timeout = timeout || 60 * 86400;

      let data = _this2.data;
      if (_this2.toJSON) {
        data = _this2.toJSON();
      }

      let key = _this2.key;
      let id = _this2.id;
      if (!id) {
        id = _this2.id = 'sled.' + key + '.' + (0, _stringRandom2.default)(10);
      }
      let payload = _this2.payload = {
        id,
        key,
        notify,
        data,
        name: _this2.name,
        result: null,
        error: null,
        timeout: timeout || 0,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + timeout * 1000)
      };
      let item = _this2.item = {
        id,
        name: _this2.name,
        key
      };

      let cache = _this2.createCacheDriver();
      if (cache) {
        yield cache.set(id, payload);
      } else {
        item.payload = payload;
      }

      let queue = _this2.createQueueDriver();
      yield queue.push(item);

      return item;
    })();
  }

  /**
   * [async]等待队列中sled执行
   * @param {number} [waitTimeout] 超时时间,单位秒,默认为Infinity,超时后将返回null
   * @param {number} [sledTimeout] Sled执行超时时间,单位秒,默认为60天
   */
  wait(waitTimeout, sledTimeout) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (_this3.result) {
        return _this3.result;
      }
      if (_this3.error) {
        throw _this3.error;
      }

      let id = _this3.id;
      if (!id) {
        id = _this3.id = 'sled.' + _this3.key + '.' + (0, _stringRandom2.default)(10);
      }
      let subscribe = _this3.createSubscribeDriver(id);

      if (!_this3.item) {
        //异步将sled插入队列
        _this3.send(sledTimeout, true);
      }

      let msg = yield subscribe.once(waitTimeout);
      if (!msg) {
        return msg;
      }
      let cache = _this3.createCacheDriver();
      if (cache) {
        let payload = yield cache.get(id);
        if (payload) {
          _this3.payload = payload;
        }
      } else {
        //没有将数据放入缓存
        _this3.payload.result = msg.result;
        _this3.payload.error = msg.error;
      }
      if (_this3.payload.error) {
        _this3.error = new Error(_this3.payload.error);
        throw _this3.error;
      }
      _this3.result = _this3.payload.result;
      return _this3.result;
    })();
  }

  /**
   * 将运行后的状态更新到缓存
   * @private
   */
  update() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let payload = _this4.payload;
      if (!payload) {
        return;
      }
      payload.result = _this4.result;
      if (_this4.error) {
        payload.error = _this4.error.message;
      }

      let cache = _this4.createCacheDriver();
      if (cache) {
        yield cache.set(_this4.item.id, payload);
      }
      if (payload.notify) {
        let subscribe = _this4.createSubscribeDriver(payload.id);
        yield subscribe.publish({
          id: payload.id,
          error: payload.error,
          result: payload.result
        });
      }
    })();
  }

  /**
   * [async] 执行sled
   * @returns {*}
   */
  run() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (_this5.error) {
        throw _this5.error;
      }
      if (_this5.result !== null) {
        return _this5.result;
      }
      if (_this5.constructor._pre) {
        yield _collie2.default.compose(_this5.constructor._pre, [], _this5);
      }

      let result;
      try {
        result = _this5.exec(_this5.data);
        if (result && result.then) {
          result = yield result;
        }
      } catch (error) {
        _this5.error = error;
        _this5.payload && _this5.update();
        throw error;
      }
      _this5.result = result;
      _this5.payload && _this5.update();

      if (_this5.constructor._post) {
        yield _collie2.default.compose(_this5.constructor._post, [result], _this5);
      }

      return result;
    })();
  }

  /**
   * @method exec
   */
}
exports.default = Sled;