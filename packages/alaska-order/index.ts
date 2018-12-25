import { Service } from 'alaska';
import CheckPayTimeout from './sleds/CheckPayTimeout';
import CheckReceiveTimeout from './sleds/CheckReceiveTimeout';
import CheckRefundTimeout from './sleds/CheckRefundTimeout';

class OrderService extends Service {
  /**
   * 检查支付超时Interval Timer
   */
  checkPayTimer: NodeJS.Timer;
  /**
   * 检查收货超时Interval Timer
   */
  checkReceiveTimer: NodeJS.Timer;
  /**
   * 检查退款超时Interval Timer
   */
  checkRefundTimer: NodeJS.Timer;

  postStart() {
    // 每10秒检查一次支付超时
    this.checkPayTimer = setInterval(() => CheckPayTimeout.run(), 10000);
    // 每1分钟检查一次收货超时
    this.checkReceiveTimer = setInterval(() => CheckReceiveTimeout.run(), 60000);
    // 每1分钟检查一次退款超时
    this.checkRefundTimer = setInterval(() => CheckRefundTimeout.run(), 60000);
  }
}

export default new OrderService({ id: 'alaska-order' });
