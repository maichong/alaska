import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import Timeout from './Timeout';

export default class CheckPayTimeout extends Sled<{}, any> {
  async exec() {
    let records = await Order.find({
      state: 200,
      paymentTimeout: {
        $lt: new Date()
      }
    }).limit(10);
    if (!records.length) return;
    await Timeout.run({ records });
  }
}
