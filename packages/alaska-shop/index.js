// @flow

import { Service } from 'alaska';

/**
 * @class ShopService
 */
class ShopService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-shop';
    super(options);
  }
}

export default new ShopService();
