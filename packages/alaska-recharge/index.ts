import { Service } from 'alaska';
import Payment from 'alaska-payment/models/Payment';
import Recharge from './models/Recharge';

/**
 * @class RechargeService
 */
class RechargeService extends Service {
  postInit() {
    Recharge._fields.type.options = Recharge._fields.type.options.concat(Payment.fields.type.options);
  }
}

export default new RechargeService({
  id: 'alaska-recharge'
});
