// @flow

function sleep(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

/**
 * @type {Object}
 */
const queues = {};

export default class ArrayQueueDriver {

  key: string;
  options: Object;
  _free: boolean;
  isQueueDriver: boolean;
  constructor(options: Object) {
    this.key = options.key;
    this.options = options;
    this.isQueueDriver = true;
    this._free = false;
    if (!queues[this.key]) {
      queues[this.key] = [];
    }
  }

  /**
   * [async] 将元素插入队列
   * @param {*} item
   */
  async push(item: any) {
    this._free = false;
    queues[this.key].push(item);
  }

  /**
   * [async] 读取队列中的元素
   * @param {number} timeout 超时时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {*}
   */
  async pop(timeout: number): any {
    this._free = false;
    if (timeout === 0) {
      timeout = Infinity;
    }
    if (timeout === undefined) {
      timeout = 0;
    }
    while (!queues[this.key].length && timeout > 0) {
      await sleep(1);
      timeout -= 1000;
      if (this._free) {
        return null;
      }
    }
    return queues[this.key].shift();
  }

  /**
   * 释放当前所有任务,进入空闲状态
   */
  free() {
    this._free = true;
  }

  /**
   * 销毁队列
   */
  destroy() {
    //This package may cause memory leak.
  }
}
