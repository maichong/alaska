import { Service, DriverOptions } from '.';

export default class Driver<O extends DriverOptions, D> {
  static readonly classOfDriver = true;
  readonly instanceOfDriver: true;
  type: string;
  service: Service;
  options: O;
  recycled: boolean;
  idle: null | Date;
  _driver: D;

  constructor(options: O, service: Service) {
    this.type = options.type;
    this.service = service;
    this.options = options;
    this.instanceOfDriver = true;
    this.recycled = options.recycled || false;
    this._driver = null;
    this.idle = null;
  }

  /**
   * 获取底层驱动
   * @returns {any}
   */
  driver(): D {
    return this._driver;
  }

  /**
   * 释放驱动，驱动转入空闲
   */
  free() {
    if (!this.recycled) {
      this.destroy();
    } else {
      this.idle = new Date();
    }
  }

  /**
   * 销毁驱动
   */
  destroy() {
    // abstract method
    this._driver = null;
  }
}
