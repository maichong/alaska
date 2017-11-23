// @flow

import alaska, { Service } from 'alaska';
import path from 'path';

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
