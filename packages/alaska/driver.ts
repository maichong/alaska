import { Service, DriverConfig } from '.';

export default class Driver<C extends DriverConfig, D> {
  static readonly classOfDriver = true;
  readonly instanceOfDriver: true;
  type: string;
  service: Service;
  config: C;
  recycled: boolean;
  idle: null | Date;
  _driver: D;

  constructor(config: C, service: Service) {
    this.type = config.type;
    this.service = service;
    this.config = config;
    this.instanceOfDriver = true;
    this.recycled = config.recycled || false;
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
