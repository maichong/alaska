// @flow

import alaska, { Service } from 'alaska';
import path from 'path';

/**
 * @class ShopService
 */
class ShopService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-shop';
    super(options);
  }

  preLoadConfig() {
    let ORDER: any = alaska.service('alaska-order', true);
    if (ORDER) {
      ORDER.addConfigDir(path.join(__dirname, '/config/alaska-order'));
    }
    let GOODS: any = alaska.service('alaska-goods', true);
    if (GOODS) {
      GOODS.addConfigDir(path.join(__dirname, '/config/alaska-goods'));
    }
  }
}

export default new ShopService();
