// @flow

export default class Driver {
  static classOfDriver = true;
  service: Alaska$Service;
  options: Object;
  instanceOfDriver: true;
  idle: number;
  idleId: string;
  onDestroy: void | Function;

  constructor(service: Alaska$Service, options: Object) {
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
