import { Driver, DriverOptions } from 'alaska';

export interface CacheDriverOptions extends DriverOptions {
  maxAge?: number;
}

export default class CacheDriver<T, O extends CacheDriverOptions=any, D=any> extends Driver<O, D> {
  static readonly classOfCacheDriver: true;
  readonly instanceOfCacheDriver: true;

  /**
   * 设置缓存
   * @param {string} key
   * @param {any} value
   * @param {number} [lifetime] 超时时间，为0则永不过期，默认按驱动初始化参数maxAge而定，单位毫秒
   * @returns {Promise<void>}
   */
  set(key: string, value: T, lifetime?: number): Promise<void>;

  /**
   * 获取缓存
   * @param {string} key
   * @returns {Promise<any>}
   */
  get(key: string): Promise<T | null>;

  /**
   * 删除缓存
   * @param {string} key
   * @returns {Promise<void>}
   */
  del(key: string): Promise<void>;


  /**
   * 判断缓存键是否存在
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  has(key: string): Promise<boolean>;

  /**
   * 自增并返回结果，如果key不存在则创建，并返回1
   * @param {string} key
   * @returns {Promise<number>}
   */
  inc(key: string): Promise<number>;

  /**
   * 自减并返回结果，如果key不存在则创建，并返回-1
   * @param {string} key
   * @returns {Promise<number>}
   */
  dec(key: string): Promise<number>;

  /**
   * 返回缓存数量
   * @returns {Promise<number>}
   */
  size(): Promise<number>;

  /**
   * 清理过期缓存
   * @returns {Promise<void>}
   */
  prune(): Promise<void>;

  /**
   * 清空缓存
   * @returns {Promise<void>}
   */
  flush(): Promise<void>
}
