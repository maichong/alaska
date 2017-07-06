// @flow

import { Service } from 'alaska';

/**
 * @class MenuService
 */
class MenuService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-menu';
    super(options);
  }
}

export default new MenuService();
