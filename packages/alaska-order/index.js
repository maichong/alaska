// @flow

import alaska, { Service } from 'alaska';
import path from 'path';

class OrderService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-order';
    super(options);
  }

  preLoadConfig() {
    let PAYMENT: any = alaska.service('alaska-payment', true);
    if (PAYMENT) {
      PAYMENT.addConfigDir(path.join(__dirname, '/config/alaska-payment'));
    }
  }
}

export default new OrderService();
