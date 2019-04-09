import { Driver, DriverConfig } from 'alaska';

export interface SubscribeDriverConfig extends DriverConfig {
  channel: string;
}

export default class SubscribeDriver<T, C extends SubscribeDriverConfig=any, D=any> extends Driver<C, D> {
  static readonly classOfSubscribeDriver: true;
  readonly instanceOfSubscribeDriver: true;

  /**
   * 发布消息
   * @param {any} message
   */
  publish(message: T): Promise<void>;

  /**
   * 订阅消息
   * @returns {Promise<void>}
   */
  subscribe(): Promise<void>;

  /**
   * 从频道读取一条消息
   * @param {number} [timeout] 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  read(timeout?: number): Promise<T | null>;

  /**
   * 只订阅一次信息
   * @param {number} timeout 超时时间,单位毫秒,默认为Infinity,超时后返回null
   * @returns {Promise<Object|null>}
   */
  once(timeout?: number): Promise<T | null>;

  /**
   * 取消订阅
   */
  cancel(): Promise<void>;
}
