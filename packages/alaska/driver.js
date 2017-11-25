'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Driver {

  constructor(service, options) {
    this.service = service;
    this.options = options;
    this.instanceOfDriver = true;
    this.idle = 0;
    this.idleId = '';
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver() {
    return null;
  }

  /**
   * 释放驱动，驱动转入空闲
   */
  free() {
    // $Flow
    this.service.freeDriver(this);
  }

  /**
   * 销毁驱动
   */
  destroy() {
    if (this.onDestroy) {
      this.onDestroy();
    }
  }
}
exports.default = Driver;
Driver.classOfDriver = true;