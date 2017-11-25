// @flow

import { Service } from 'alaska';

class OrderService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-order';
    super(options);
  }
}

export default new OrderService();
