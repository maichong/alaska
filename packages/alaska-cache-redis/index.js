const redis = require('redis');
const debug = require('debug')('alaska-cache-redis');

class RedisCacheDriver {
  static classOfCacheDriver = true;

  instanceOfCacheDriver: true;
  _maxAge: number;
  _driver: Object;

  constructor(options) {
    this.instanceOfCacheDriver = true;
    this._maxAge = options.maxAge || 0;
    this._driver = redis.createClient(options);
    this.type = 'redis';
    //标识已经是缓存对象实例
    this.isCacheDriver = true;
    //标识本驱动会序列化数据
    this.noSerialization = false;
  }

  /**
   * @returns {Redis}
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
  set(key: string, value: any, lifetime?: number): Promise<void> {
    debug('set', key, '=>', value, '(', lifetime !== undefined ? lifetime : '{' + this._maxAge + '}', ')');
    lifetime = lifetime === undefined ? this._maxAge : lifetime;
    return new Promise((resolve, reject) => {
      let args = [key, JSON.stringify(value)];
      if (lifetime) {
        args.push('PX', lifetime);
      }
      args.push((error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      this._driver.set.apply(this._driver, args);
    });
  }

  /**
   * [async] 获取缓存
   * @param key
   * @returns {*}
   */
  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._driver.get(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          if (res !== null) {
            try {
              res = JSON.parse(res);
            } catch (error) {
              res = null;
            }
          }
          debug('get', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * [async] 删除缓存
   * @param key
   */
  del(key: string): Promise<void> {
    debug('del', key);
    return new Promise((resolve, reject) => {
      this._driver.del(key, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * [async] 判断缓存键是否存在
   * @param key
   * @returns {boolean}
   */
  has(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._driver.exists(key, (error, exists) => {
        if (error) {
          reject(error);
        } else {
          debug('has', key, '=>', !!exists);
          resolve(!!exists);
        }
      })
    });
  }

  /**
   * [async] 自增并返回结果
   * @param key
   * @returns {number}
   */
  inc(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.incr(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          debug('inc', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * [async] 自减并返回结果
   * @param key
   * @returns {number}
   */
  dec(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.decr(key, (error, res) => {
        if (error) {
          reject(error);
        } else {
          debug('inc', key, '=>', res);
          resolve(res);
        }
      });
    });
  }

  /**
   * [async] 返回缓存数量
   * @returns {number}
   */
  size(): Promise<number> {
    return new Promise((resolve, reject) => {
      this._driver.dbsize((error, size) => {
        if (error) {
          reject(error);
        } else {
          debug('size', size);
          resolve(size);
        }
      });
    });
  }

  /**
   * [async] 清理过期缓存
   */
  prune(): Promise<void> {
    debug('prune');
    return Promise.resolve();
  }

  /**
   * [async] 清空缓存
   */
  flush(): Promise<void> {
    debug('flush');
    return new Promise((resolve, reject) => {
      this._driver.flushdb((error, size) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

}

module.exports = RedisCacheDriver.default = RedisCacheDriver;
