import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Order from 'alaska-order/models/Order';
import CreatePayment from 'alaska-payment/sleds/Create';

export async function pre() {
  const me = this as CreatePayment;
  let params = me.params;
  let orders = params.orders;
  if (params.payment || !orders || !Array.isArray(orders) || !orders.length) return;
  let user = params.user || paymentService.error('Missing user info');
  let type = params.type || paymentService.error('Missing payment type');
  if (!paymentService.payments[type]) paymentService.error('Unknown payment type');

  let amount = 0;
  let payment = new Payment({
    user,
    type,
    orders: []
  });
  for (let order of orders) {
    if (typeof order === 'string') {
      order = await Order.findById(order).where('user', user._id).session(me.dbSession);
      if (!order) paymentService.error('Order not found');
      if (order.state !== 200) {
        paymentService.error('Order state error');
      }
    }
    payment.orders.push(order._id);
    amount += order.pay;
    if (!payment.title) {
      payment.title = order.title;
    }
  }
  payment.amount = amount;
  params.payment = payment;
}
