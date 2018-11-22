import { Service } from 'alaska';
import Order from './models/Order';

/// <reference types="alaska-extension-model" />

class MainService extends Service {
  async postInit() {
    // let test = this.modules.services.test;
    // test.models;
    // test.sleds;

    // let order = await Order.findById(123);

    // let o = new Order();

    // order.title = 'test';
    // order.save();
  }
}

export default new MainService({
  id: 'test'
});
