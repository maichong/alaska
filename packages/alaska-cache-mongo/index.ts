import * as url from 'url';
import * as mongodb from 'mongodb';
import * as Debugger from 'debug';
import { Service } from 'alaska';
import CacheDriver from 'alaska-cache';
import * as _ from 'lodash';
import { MongoCacheDriverOptions } from 'alaska-cache-mongo';

const debug = Debugger('alaska-cache-mongo');

export default class MongoCacheDriver<T> extends CacheDriver<T, MongoCacheDriverOptions, mongodb.Collection> {
  _maxAge: number;
  _connecting: Promise<mongodb.MongoClient>;
  _client: mongodb.MongoClient;
  _pruneTimer: NodeJS.Timer;

  constructor(options: MongoCacheDriverOptions, service: Service) {
    super(options, service);
    this._maxAge = options.maxAge || 0;
    let info = url.parse(options.uri);
    if (!info.path) {
      throw new Error('mongodb uri error');
    }

    let mongoOpts: mongodb.MongoClientOptions = _.omit(options, 'id', 'uri', 'type', 'collection', 'maxAge');
    mongoOpts.useNewUrlParser = true;

    this._connecting = mongodb.MongoClient.connect(options.uri, mongoOpts);
    this._connecting.then((client: mongodb.MongoClient) => {
      let db = client.db(info.path.substr(1));
      this._client = client;
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
    this._pruneTimer = global.setInterval(() => {
      this.prune();
    }, 10 * 60 * 1000);
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {any} value
   * @param {number} [lifetime] 超时时间，为0则永不过期，默认按驱动初始化参数maxAge而定，单位毫秒
   * @returns {Promise<void>}
   */
  set(key: string, value: T, lifetime?: number): Promise<any> {
    if (this._connecting) {
      return this._connecting.then(() => this.set(key, value, lifetime));
    }
    debug('set', key, '=>', value, '(', typeof lifetime !== 'undefined' ? lifetime : `{${this._maxAge}}`, ')');
    lifetime = typeof lifetime === 'undefined' ? this._maxAge : lifetime;

    let expiredAt: Date | 0 = 0;
    if (lifetime) {
      expiredAt = new Date(Date.now() + lifetime);
    }

    return this._driver.findOneAndReplace(
      {
        _id: key
      },
      {
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
   * @param {string} key
   * @returns {Promise<any>}
   */
  get(key: string): Promise<T> {
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
   * 删除缓存
   * @param {string} key
   * @returns {Promise<void>}
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
   * 判断缓存键是否存在
   * @param {string} key
   * @returns {Promise<boolean>}
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
   * 自增并返回结果，如果key不存在则创建，并返回1
   * @param {string} key
   * @returns {Promise<number>}
   */
  inc(key: string): Promise<number> {
    if (this._connecting) {
      return this._connecting.then(() => this.inc(key));
    }
    let expiredAt: Date | 0 = 0;
    if (this._maxAge) {
      expiredAt = new Date(Date.now() + this._maxAge);
    }
    return this._driver.findOneAndUpdate(
      { _id: key },
      {
        $inc: { value: 1 }, $set: { expiredAt }
      },
      { upsert: true, returnOriginal: false }
    ).then((doc) => {
      debug('inc', key, '=>', doc.value);
      return doc.value;
    });
  }

  /**
   * 自减并返回结果，如果key不存在则创建，并返回-1
   * @param {string} key
   * @returns {Promise<number>}
   */
  dec(key: string): Promise<number> {
    if (this._connecting) {
      return this._connecting.then(() => this.dec(key));
    }
    let expiredAt: Date | 0 = 0;
    if (this._maxAge) {
      expiredAt = new Date(Date.now() + this._maxAge);
    }
    return this._driver.findOneAndUpdate(
      { _id: key },
      {
        $inc: { value: -1 }, $set: { expiredAt }
      },
      { upsert: true, returnOriginal: false }
    ).then((doc) => {
      debug('dec', key, '=>', doc.value);
      return doc.value;
    });
  }

  /**
   * 返回缓存数量
   * @returns {Promise<number>}
   */
  size(): Promise<number> {
    if (this._connecting) {
      return this._connecting.then(() => this.size());
    }
    debug('size');
    return this._driver.countDocuments();
  }

  /**
   * 清理过期缓存
   * @returns {Promise<void>}
   */
  prune(): Promise<void> {
    if (this._connecting) {
      return this._connecting.then(() => this.prune());
    }
    debug('prune');
    return this._driver.deleteMany({
      $or: [
        { expiredAt: null },
        {
          expiredAt: { $ne: 0, $lt: new Date() }
        }
      ]
    }).then(() => { });
  }

  /**
   * 清空缓存
   * @returns {Promise<void>}
   */
  flush(): Promise<void> {
    if (this._connecting) {
      return this._connecting.then(() => this.flush());
    }
    debug('flush');
    return this._driver.drop();
  }

  /**
   * 销毁
   */
  destroy() {
    clearInterval(this._pruneTimer);
    this._client.close();
    this._client = null;
    this._driver = null;
  }
}
