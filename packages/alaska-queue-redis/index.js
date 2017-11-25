'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RedisQueueDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfQueueDriver = true;
    this.key = options.key;
    this._driver = _redis2.default.createClient(options);
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return this._driver;
  }

  /**
   * 将元素插入队列
   * @param {*} item
   * @returns {Promise<void>}
   */
  push(item) {
    return new Promise((resolve, reject) => {
      this._driver.rpush(this.key, JSON.stringify(item), error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 读取队列中的元素
   * @param {number} [timeout] 超时时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  pop(timeout) {
    let method = timeout === undefined ? 'lpop' : 'blpop';
    return new Promise((resolve, reject) => {
      let args = [this.key];
      if (method === 'blpop') {
        // $Flow
        args.push(parseInt(timeout / 1000));
      }
      args.push((error, res) => {
        if (error) {
          reject(error);
        } else {
          if (res !== null) {
            try {
              if (Array.isArray(res)) {
                res = res[1];
              }
              res = JSON.parse(res);
            } catch (err) {
              res = null;
            }
          }
          resolve(res);
        }
      });
      this._driver[method](...args);
    });
  }

  onFree() {}

  /**
   * 销毁队列
   */
  onDestroy() {
    this._driver.quit();
    this._driver = null;
  }
}
exports.default = RedisQueueDriver;
RedisQueueDriver.classOfQueueDriver = true;