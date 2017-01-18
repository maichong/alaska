// @flow

import { Service } from 'alaska';

/**
 * @class HelpService
 */
class HelpService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-help';
    super(options);
  }
}

export default new HelpService();
