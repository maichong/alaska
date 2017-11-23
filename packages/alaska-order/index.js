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
}

export default new OrderService();
