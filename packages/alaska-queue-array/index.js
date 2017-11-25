'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

/**
 * @type {Object}
 */


const queues = {};

class ArrayQueueDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfQueueDriver = true;
    this.key = options.key;
    this._free = false;
    if (!queues[this.key]) {
      queues[this.key] = [];
    }
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return queues;
  }

  /**
   * 将元素插入队列
   * @param {*} item
   * @returns {Promise<void>}
   */
  async push(item) {
    this._free = false;
    queues[this.key].push(item);
  }

  /**
   * 读取队列中的元素
   * @param {number} timeout 超时时间,单位毫秒,默认不阻塞,为0则永久阻塞
   * @returns {Promise<any>}
   */
  async pop(timeout) {
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
  onFree() {}

  /**
   * 销毁队列
   */
  onDestroy() {
    //This package may cause memory leak.
  }
}
exports.default = ArrayQueueDriver;
ArrayQueueDriver.classOfQueueDriver = true;