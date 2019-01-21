import PayOrder from 'alaska-order/sleds/Pay';
import Order from 'alaska-order/models/Order';
import CompletePayment from 'alaska-payment/sleds/Complete';

export async function pre() {
  const me = this as CompletePayment;
  let record = me.params.record;
  if (!record.orders || !record.orders.length) return;
  for (let order of record.orders) {
    if (!order.save) {
      order = await Order.findById(order).session(me.dbSession);
    }
    if (record.orders.length === 1) {
      order.payed += record.amount;
    } else {
      // 多个订单一起支付
      order.payed = order.pay;
    }
    order.payment = record.type;
    await PayOrder.run({ record: order }, { dbSession: me.dbSession });
  }
  me.params.done = true;
}
