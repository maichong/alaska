
import service from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Order from 'alaska-order/models/Order';

export async function pre() {
  let data = this.data;
  let orders = data.orders;
  if (!orders || !Array.isArray(orders) || !orders.length) return;
  let user = data.user || service.error('Missing user info');
  let type = data.type || service.error('Missing payment type');
  if (!service.payments[type]) service.error('Unknown payment type');

  let amount = 0;
  let payment = new Payment({
    user,
    type,
    orders: []
  });
  for (let order of orders) {
    if (typeof order === 'string') {
      order = await Order.findById(order).where('user', user._id);
      if (!order) service.error('Order not found');
      if (order.state !== 200) {
        service.error('Order state error');
      }
    }
    payment.orders.push(order._id);
    amount += order.pay;
    if (!payment.title) {
      payment.title = order.title;
    }
  }
  payment.amount = amount;
  payment.params = await service.payments[type].createParams(payment);
  await payment.save();
  data.payment = payment;
}
