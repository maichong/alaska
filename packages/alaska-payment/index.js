// @flow

import { Service } from 'alaska';

/**
 * @class PaymentService
 */
class PaymentService extends Service {

  static payments: Object;

  payments: Object;

  constructor(options?:Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-payment';
    super(options);
    this.payments = {};
  }
}

export default new PaymentService();
