// @flow

/* eslint new-cap:0 */

import mongodb from 'mongodb';
import Debugger from 'debug';
import { Driver } from 'alaska';

const MongoClient = mongodb.MongoClient;
const debug = Debugger('alaska-cache-mongo');

export default class MongoCacheDriver extends Driver {
  static classOfCacheDriver: true;

  instanceOfCacheDriver: true;
  _maxAge: number;
  _connecting: Object|null;
  _driver: Object;
  _db: Object;

  constructor(service: Alaska$Service, options: Object) {
    super(service, options);
    this.instanceOfCacheDriver = true;
    this._maxAge = options.maxAge || 0;
    this._connecting = MongoClient.connect(options.url, {
      uri_decode_auth: options.uri_decode_auth,
      db: options.db,
      server: options.server,
      replSet: options.replSet,
      mongos: options.mongos
    });
    this._connecting.then((db) => {
      this._db = db;
      this._connecting = null;
      this._driver = db.collection(options.collection || 'mongo_cache');
      this._driver.createIndex('expiredAt', {
        background: true
      });
    }, (error) => {
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
  driver(): any {
    return this._driver;
  }

  /**
   * [async] 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {*}
   */
  set(key: string, value: any, lifetime?: number): Promise<any> {
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
   * [async] 获取缓存
   * @param key
   * @returns {*}
   */
  get(key: string): Promise<any> {
    if (this._connecting) {
      return this._connecting.then(() => this.get(key));
    }
    return this._driver.findOne({
      _id: key
    }).then((doc) => {
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
   * [async] 删除缓存
   * @param key
   */
  del(key: string): any {
    if (this._connecting) {
      return this._connecting.then(() => this.del(key));
    }
    debug('del', key);
    return this._driver.deleteOne({
      _id: key
    });
  }

  /**
   * [async] 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key: string): Promise<boolean> {
    if (this._connecting) {
      return this._connecting.then(() => this.has(key));
    }
    return this._driver.findOne({
      _id: key
    }).then((doc) => {
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
   * [async] 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key: string): Promise<number> {
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
    }).then((doc) => {
      let value = doc.value ? doc.value.value + 1 : 1;
      debug('inc', key, '=>', value);
      return Promise.resolve(value);
    });
  }

  /**
   * [async] 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key: string): Promise<number> {
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
    }).then((doc) => {
      let value = doc.value ? doc.value.value - 1 : 1;
      debug('dec', key, '=>', value);
      return Promise.resolve(value);
    });
  }

  /**
   * [async] 返回缓存数量
   * @returns {number}
   */
  size(): number {
    if (this._connecting) {
      return this._connecting.then(() => this.size());
    }
    debug('size');
    return this._driver.count();
  }

  /**
   * [async] 清理过期缓存
   */
  prune(): any {
    if (this._connecting) {
      return this._connecting.then(() => this.prune());
    }
    debug('prune');
    return this._driver.deleteMany({ $or: [{ expiredAt: null }, { expiredAt: { $ne: 0, $lt: new Date() } }] });
  }

  /**
   * [async] 清空缓存
   */
  flush(): any {
    if (this._connecting) {
      return this._connecting.then(() => this.flush());
    }
    debug('flush');
    return this._driver.drop();
  }

  /**
   * 空闲
   */
  onFree() {
  }

  /**
   * 销毁
   */
  onDestroy() {
    this._db.close();
    this._db = {};
    this._driver = {};
  }
}
