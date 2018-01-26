'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _alaska = require('alaska');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MongoClient = _mongodb2.default.MongoClient;

/* eslint new-cap:0 */

const debug = (0, _debug2.default)('alaska-cache-mongo');

class MongoCacheDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfCacheDriver = true;
    this._maxAge = options.maxAge || 0;
    let info = _url2.default.parse(options.url);
    if (!info.path) {
      throw new Error('mongodb url error');
    }
    this._connecting = MongoClient.connect(options.url, _lodash2.default.omit(options, 'id', 'url', 'type', 'collection', 'maxAge'));
    this._connecting.then(client => {
      // $Flow
      this._db = client.db(info.path.substr(1));
      this._connecting = null;
      this._driver = this._db.collection(options.collection || 'mongo_cache');
      this._driver.createIndex('expiredAt', {
        background: true
      });
    }, error => {
      console.error(error.stack);
      process.exit(1);
    });

    //每10分钟自动清理一次
    setInterval(() => {
      this.prune();
    }, 10 * 60 * 1000);
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return this._driver;
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {*}
   */
  set(key, value, lifetime) {
    if (this._connecting) {
      return this._connecting.then(() => this.set(key, value, lifetime));
    }
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    lifetime = lifetime === undefined ? this._maxAge : lifetime;

    let expiredAt = 0;
    if (lifetime) {
      expiredAt = new Date(Date.now() + lifetime);
    }

    return this._driver.findOneAndReplace({
      _id: key
    }, {
      _id: key,
      value,
      expiredAt
    }, {
      upsert: true,
      returnOriginal: false
    });
  }

  /**
   * 获取缓存
   * @param key
   * @returns {*}
   */
  get(key) {
    if (this._connecting) {
      return this._connecting.then(() => this.get(key));
    }
    return this._driver.findOne({
      _id: key
    }).then(doc => {
      if (!doc) {
        debug('get', key, '=>', null);
        return Promise.resolve(null);
      }
      if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date())) {
        //已过期
        debug('get', key, '=>', null);
        this.del(key);
        return null;
      }
      debug('get', key, '=>', doc.value);
      return Promise.resolve(doc.value);
    });
  }

  /**
   * 删除缓存
   * @param key
   */
  del(key) {
    if (this._connecting) {
      return this._connecting.then(() => this.del(key));
    }
    debug('del', key);
    return this._driver.deleteOne({
      _id: key
    });
  }

  /**
   * 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key) {
    if (this._connecting) {
      return this._connecting.then(() => this.has(key));
    }
    return this._driver.findOne({
      _id: key
    }).then(doc => {
      if (!doc) {
        debug('has', key, '=>', false);
        return Promise.resolve(false);
      }
      if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date())) {
        //已过期
        return this.del(key);
      }
      debug('has', key, '=>', true);
      return Promise.resolve(true);
    });
  }

  /**
   * 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key) {
    if (this._connecting) {
      return this._connecting.then(() => this.inc(key));
    }
    let expiredAt = 0;
    if (this._maxAge) {
      expiredAt = new Date(Date.now() + this._maxAge);
    }
    return this._driver.findOneAndUpdate({ _id: key }, { $inc: { value: 1 }, $set: { expiredAt } }, {
      new: true,
      upsert: true
    }).then(doc => {
      let value = doc.value ? doc.value.value + 1 : 1;
      debug('inc', key, '=>', value);
      return Promise.resolve(value);
    });
  }

  /**
   * 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key) {
    if (this._connecting) {
      return this._connecting.then(() => this.dec(key));
    }
    let expiredAt = 0;
    if (this._maxAge) {
      expiredAt = new Date(Date.now() + this._maxAge);
    }
    return this._driver.findOneAndUpdate({ _id: key }, { $inc: { value: 1 }, $set: { expiredAt } }, {
      new: true,
      upsert: true
    }).then(doc => {
      let value = doc.value ? doc.value.value - 1 : 1;
      debug('dec', key, '=>', value);
      return Promise.resolve(value);
    });
  }

  /**
   * 返回缓存数量
   * @returns {number}
   */
  size() {
    if (this._connecting) {
      return this._connecting.then(() => this.size());
    }
    debug('size');
    return this._driver.count();
  }

  /**
   * 清理过期缓存
   */
  prune() {
    if (this._connecting) {
      return this._connecting.then(() => this.prune());
    }
    debug('prune');
    return this._driver.deleteMany({ $or: [{ expiredAt: null }, { expiredAt: { $ne: 0, $lt: new Date() } }] });
  }

  /**
   * 清空缓存
   */
  flush() {
    if (this._connecting) {
      return this._connecting.then(() => this.flush());
    }
    debug('flush');
    return this._driver.drop();
  }

  /**
   * 空闲
   */
  onFree() {}

  /**
   * 销毁
   */
  onDestroy() {
    this._db.close();
    this._db = {};
    this._driver = {};
  }
}
exports.default = MongoCacheDriver;
MongoCacheDriver.classOfCacheDriver = true;