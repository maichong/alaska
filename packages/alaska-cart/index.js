// @flow

import { Service } from 'alaska';

class CartService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-cart';
    super(options, alaska);
  }
}

export default new CartService();
