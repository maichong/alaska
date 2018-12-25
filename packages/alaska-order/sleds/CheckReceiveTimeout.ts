import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import Receive from './Receive';

export default class CheckReceiveTimeout extends Sled<{}, any> {
  async exec() {
    let records = await Order.find({
      state: 500,
      receiveTimeout: {
        $lt: new Date()
      }
    }).limit(10);
    if (!records.length) return;
    await Receive.run({ records });
  }
}