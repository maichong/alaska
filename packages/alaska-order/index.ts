import { Service } from 'alaska';

class OrderService extends Service {
  // TODO: 买家付款超时
  // TODO: 买家收货超时
  // TODO: 商家审核退款超时
}

export default new OrderService({ id: 'alaska-order' });
