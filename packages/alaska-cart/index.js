// @flow

import { Service } from 'alaska';

class CartService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-cart';
    super(options);
  }
}

export default new CartService();
