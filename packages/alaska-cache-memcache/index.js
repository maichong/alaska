const memcache = require('memcache');
const debug = require('debug')('alaska-cache-memcache');

class MemcacheCacheDriver {
  constructor(options) {
    this._maxAge = options.maxAge || 0;
    this._options = options || {};
    this.type = 'memcache';
    //标识已经是缓存对象实例
    this.isCacheDriver = true;
    //标识本驱动会序列化数据
    this.noSerialization = false;
    this._connect();
  }

  _connect() {
    if (this._connecting) {
      return this._connecting;
    }
    if (this._driver) {
      return Promise.resolve();
    }
    this._driver = new memcache.Client(this._options.port, this._options.host);
    debug('connect');
    return this._connecting = new Promise((resolve, reject) => {
      this._driver.on('connect', ()=> {
        this._connecting = null;
        resolve();
      });
      this._driver.on('error', e => {
        console.error(e.stack);
        if (this._connecting) {
          this._connecting = null;
          this._driver.removeAllListeners();
          this._driver.close();
          reject(e);
        }
      });
      this._driver.on('close', () => {
        this._driver.removeAllListeners();
        this._driver = null;
        if (this._connecting) {
          this._connecting = null;
          reject();
        }
      });
      this._driver.connect();
    });
  }

  /**
   * @returns {Memcache}
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
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.set(key, value, lifetime);
      });
    }
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    lifetime = lifetime === undefined ? this._maxAge : lifetime;
    return new Promise((resolve, reject) => {
      this._driver.set(key, JSON.stringify(value), (error, res) => {
        if (error) {
          return reject(new Error(error));
        }
        resolve(res);
      }, lifetime);
    });
  }

  /**
   * [async] 获取缓存
   * @param key
   * @returns {*}
   */
  get(key: string) {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.get(key);
      });
    }
    return new Promise((resolve, reject) => {
      this._driver.get(key, (error, res) => {
        if (error) {
          return reject(new Error(error));
        }
        if (res !== null) {
          try {
            res = JSON.parse(res);
          } catch (error) {
            res = null;
          }
        }
        debug('get', key, '=>', res);
        resolve(res);
      });
    });
  }

  /**
   * [async] 删除缓存
   * @param key
   */
  del(key: string) {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.del(key);
      });
    }
    debug('del', key);
    return new Promise((resolve, reject) => {
      this._driver.delete(key, (error) => {
        if (error) {
          return reject(new Error(error));
        }
        resolve();
      });
    });
  }

  /**
   * [async] 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key: string) {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.has(key);
      });
    }
    return new Promise((resolve, reject) => {
      this._driver.get(key, (error, res) => {
        if (error) {
          return reject(new Error(error));
        }
        debug('has', key, '=>', res !== null);
        resolve(res !== null);
      });
    });
  }

  /**
   * [async] 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key: string) {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.inc(key);
      });
    }
    return new Promise((resolve, reject) => {
      this._driver.increment(key, 1, (error, res) => {
        if (error === 'NOT_FOUND') {
          this._driver.set(key, 1, () => {
          }, this._maxAge);
          debug('inc', key, '=>', 1);
          return resolve(1);
        }
        if (error) {
          return reject(new Error(error));
        }
        res = parseInt(res) || 0;
        debug('inc', key, '=>', res);
        resolve(res);
      });
    });
  }

  /**
   * [async] 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key: string) {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.dec(key);
      });
    }
    return new Promise((resolve, reject) => {
      this._driver.decrement(key, 1, (error, res) => {
        if (error === 'NOT_FOUND') {
          this._driver.set(key, -1, () => {
          }, this._maxAge);
          debug('dec', key, '=>', -1);
          return resolve(-1);
        }
        if (error) {
          return reject(new Error(error));
        }
        res = parseInt(res) || 0;
        debug('dec', key, '=>', res);
        resolve(res);
      });
    });
  }

  /**
   * [async] 返回缓存数量
   * @returns {number}
   */
  size() {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.size();
      });
    }
    debug('size');
    return new Promise((resolve, reject) => {
      this._driver.stats((error, res) => {
        if (error) {
          return reject(new Error(error));
        }
        resolve(parseInt(res.curr_items) || 0);
      });
    });
  }

  /**
   * [async] 清理过期缓存
   */
  prune() {
    debug('prune');
    return Promise.resolve();
  }

  /**
   * [async] 清空缓存
   */
  flush() {
    if (this._connecting || !this._driver) {
      return this._connect().then(() => {
        return this.flush();
      });
    }
    debug('flush');
    return new Promise((resolve, reject) => {
      this._driver.query('flush_all', 'simple', (error) => {
        if (error) {
          return reject(new Error(error));
        }
        resolve();
      });
    });
  }
}

module.exports = MemcacheCacheDriver.default = MemcacheCacheDriver;
