// @flow

import { Service } from 'alaska';

/**
 * @class PageService
 */
class PageService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-page';
    super(options);
  }
}

export default new PageService();
