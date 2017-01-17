// @flow

import { Service } from 'alaska';

/**
 * @class MenuService
 */
class MenuService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-menu';
    super(options, alaska);
  }
}

export default new MenuService();
