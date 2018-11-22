import { Driver, DriverOptions } from 'alaska';

export interface QueueDriverOptions extends DriverOptions {
  key: string;
}

export default class QueueDriver<T, O extends QueueDriverOptions, D> extends Driver<O, D> {
  static readonly classOfQueueDriver: true;
  readonly instanceOfQueueDriver: true;

  /**
   * 将元素插入队列
   * @param {any} item
   * @returns {Promise<void>}
   */
  push(item: T): Promise<void>;

  /**
   * 读取队列中的元素
   * @param {number} [timeout] 时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  pop(timeout?: number): Promise<T | null>;
}
