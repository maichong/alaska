import Pay from 'alaska-order/sleds/Pay';
import Order from 'alaska-order/models/Order';

export async function pre() {
  let payment = this.params.payment;
  if (!payment.orders || !payment.orders.length) return;
  for (let order of payment.orders) {
    if (!order.save) {
      order = await Order.findById(order);
    }
    if (payment.orders.length === 1) {
      order.payed += payment.amount;
    } else {
      // 多个订单一起支付
      order.payed = order.pay;
    }
    order.payment = payment.type;
    await Pay.run({ record: order });
  }
  this.params.done = true;
}
