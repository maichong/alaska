
import ORDER from 'alaska-order';
import Order from 'alaska-order/models/Order';

export async function pre() {
  let payment = this.data.payment;
  if (!payment.orders || !payment.orders.length) return;
  for (let order of payment.orders) {
    if (!order.save) {
      order = await Order.findById(order);
    }
    if (payment.orders.length === 1) {
      order.payed += payment.amount;
    } else if (!order.payed) {
      //多个订单一起支付
      order.payed = order.pay;
    } else {
      //多个订单一起支付,并且当前订单中已经有已支付金额
      //异常情况
    }
    order.payment = payment.type;
    await ORDER.run('Pay', { order });
  }
  this.data.done = true;
}
