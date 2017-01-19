// @flow

import alaska, { Service } from 'alaska';

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
      ORDER.addConfigDir(__dirname + '/config/alaska-order');
    }
    let GOODS: any = alaska.service('alaska-goods', true);
    if (GOODS) {
      GOODS.addConfigDir(__dirname + '/config/alaska-goods');
    }
  }
}

export default new ShopService();
