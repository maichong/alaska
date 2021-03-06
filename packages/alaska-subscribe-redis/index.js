'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RedisSubscribeDriver extends _alaska.Driver {

  /**
   * @param {Alaska$Service} service
   * @param {Object} options Redis连接设置
   */
  constructor(service, options) {
    super(service, options);
    this.instanceOfSubscribeDriver = true;
    this.channel = options.channel;
    this.options = options;
    this._driver = _redis2.default.createClient(options);
    this._subscribed = false;
    this._timer = undefined;
    this._messages = [];
    this._onMessage = null; //message callback
    this._listener = null;
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return this._driver;
  }

  /**
   * 发布信息
   * @param {object} message
   */
  publish(message) {
    if (this._subscribed) {
      return Promise.reject(new Error('can not publish message with subscribed driver.'));
    }
    return new Promise((resolve, reject) => {
      this._driver.publish(this.channel, JSON.stringify(message), error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 订阅消息
   * @returns {Promise<Object>}
   */
  subscribe() {
    if (this._subscribed) {
      return Promise.reject(new Error('driver has already subscribed.'));
    }
    this._subscribed = true;
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
      this._listener = (channel, message) => {
        try {
          let json = JSON.parse(message);
          this._messages.push(json);
          if (this._onMessage) {
            this._onMessage();
          }
        } catch (e) {
          //JSON 解析失败
        }
      };
      this._driver.on('message', this._listener);
    });
  }

  /**
   * 从频道读取一条消息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  read(timeout) {
    if (!this._subscribed) {
      return Promise.reject(new Error('the driver is not subscribed.'));
    }
    if (this._messages.length) {
      return Promise.resolve(this._messages.shift());
    }
    if (timeout === undefined) {
      timeout = Infinity;
    }
    return new Promise(resolve => {
      let timer = 0;
      this._onMessage = () => {
        this._onMessage = null;
        if (timer) {
          clearTimeout(timer);
        }
        resolve(this._messages.shift());
      };
      if (timeout && timeout !== Infinity) {
        timer = setTimeout(() => {
          if (timer) {
            clearTimeout(timer);
          }
          this._onMessage = null;
          //超时后返回null
          resolve(null);
        }, timeout);
        this._timer = timer;
      }
    });
  }

  /**
   * 只订阅一次信息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  once(timeout) {
    if (this._subscribed) {
      return Promise.reject(new Error('driver has already subscribed.'));
    }
    this._subscribed = true;
    if (timeout === undefined) {
      timeout = Infinity;
    }
    return new Promise((resolve, reject) => {
      this._driver.subscribe(this.channel, error => {
        if (error) {
          reject(error);
        }
      });
      this._listener = (channel, message) => {
        try {
          let json = JSON.parse(message);
          this.cancel();
          resolve(json);
        } catch (e) {
          //JSON 解析失败
        }
      };
      this._driver.on('message', this._listener);

      if (timeout && timeout !== Infinity) {
        this._timer = setTimeout(() => {
          this.cancel();
          //超时后返回null
          resolve(null);
        }, timeout);
      }
    });
  }

  /**
   * 取消订阅
   */
  cancel() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
    if (!this._subscribed) {
      return Promise.resolve();
    }
    this._subscribed = false;
    return new Promise((resolve, reject) => {
      this._driver.unsubscribe(this.channel, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      if (this._listener) {
        this._driver.removeListener('message', this._listener);
        this._listener = null;
      }
    });
  }

  /**
   * 释放当前所有任务,进入空闲状态
   */
  onFree() {
    this.cancel();
    this._messages = [];
    this._onMessage = null; //message callback
  }

  /**
   * 销毁
   */
  onDestroy() {
    let destroy = () => {
      this._messages = [];
      this._onMessage = null;
      // $Flow  销毁_driver
      this._driver = null;
    };
    this.cancel().then(destroy, destroy);
  }
}
exports.default = RedisSubscribeDriver;
RedisSubscribeDriver.classOfSubscribeDriver = true;