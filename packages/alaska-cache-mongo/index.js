const MongoClient = require('mongodb').MongoClient;
const debug = require('debug')('alaska-cache-mongo');

class MongoCacheDriver {
  constructor(options) {
    this._maxAge = options.maxAge || 0;
    this._connecting = MongoClient.connect(options.url, {
      uri_decode_auth: options.uri_decode_auth,
      db: options.db,
      server: options.server,
      replSet: options.replSet,
      mongos: options.mongos
    });
    this._connecting.then(db => {
      this._connecting = null;
      this._driver = db.collection(options.collection || 'mongo_cache');
      this._driver.createIndex('expiredAt', {
        background: true
      });
    }, (error) => {
      console.error(error.stack);
      process.exit(1);
    });
    this.type = 'mongo';
    //标识已经是缓存对象实例
    this.isCacheDriver = true;
    //标识本驱动会序列化数据
    this.noSerialization = false;

    //每10分钟自动清理一次
    setInterval(()=> {
      this.prune();
    }, 10 * 60 * 1000);
  }

  /**
   * @returns {Collection}
   */
  driver() {
    return this._driver;
  }

  /**
   * [async] 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} [lifetime] 超时时间,为0不超时,默认按驱动初始化参数maxAge而定
   * @returns {*}
   */
  set(key: string, value: any, lifetime?: number) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.set(key, value, lifetime);
      });
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
      value: value,
      expiredAt: expiredAt
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
  get(key: string) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.get(key);
      });
    }
    return this._driver.findOne({
      _id: key
    }).then((doc) => {
      if (!doc) {
        debug('get', key, '=>', null);
        return Promise.resolve(null);
      }
      if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date)) {
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
  del(key: string) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.del(key);
      });
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
  has(key: string) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.has(key);
      });
    }
    return this._driver.findOne({
      _id: key
    }).then((doc) => {
      if (!doc) {
        debug('has', key, '=>', false);
        return Promise.resolve(false);
      }
      if (doc.expiredAt !== 0 && (!doc.expiredAt || doc.expiredAt < new Date)) {
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
  inc(key: string) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.inc(key);
      });
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
  dec(key: string) {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.dec(key);
      });
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
  size() {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.size();
      });
    }
    debug('size');
    return this._driver.count();
  }

  /**
   * [async] 清理过期缓存
   */
  prune() {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.prune();
      });
    }
    debug('prune');
    return this._driver.deleteMany({ $or: [{ expiredAt: null }, { expiredAt: { $ne: 0, $lt: new Date } }] });
  }

  /**
   * [async] 清空缓存
   */
  flush() {
    if (this._connecting) {
      return this._connecting.then(() => {
        return this.flush();
      });
    }
    debug('flush');
    return this._driver.drop();
  }
}

module.exports = MongoCacheDriver.default = MongoCacheDriver;
