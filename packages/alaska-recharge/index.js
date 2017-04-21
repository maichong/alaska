// @flow

import { Service } from 'alaska';
import PAYMENT from 'alaska-payment';

/**
 * @class RechargeService
 */
class RechargeService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-recharge';
    super(options);
  }

  postLoadModels() {
    const Recharge = this.model('Recharge');
    const Payment = PAYMENT.model('Payment');
    Recharge._fields.type.options = Recharge._fields.type.options.concat(Payment.fields.type.options);
  }
}

export default new RechargeService();
