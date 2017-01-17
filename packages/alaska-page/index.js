// @flow

import { Service } from 'alaska';

/**
 * @class PageService
 */
class PageService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-page';
    super(options, alaska);
  }
}

export default new PageService();
