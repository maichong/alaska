import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import AcceptRefund from './AcceptRefund';

export default class CheckRefundTimeout extends Sled<{}, any> {
  async exec() {
    let records = await Order.find({
      state: 800,
      refundTimeout: {
        $lt: new Date()
      }
    }).limit(10);
    if (!records.length) return;
    await AcceptRefund.run({ records });
  }
}
