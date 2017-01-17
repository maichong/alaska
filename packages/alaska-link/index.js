// @flow

import { Service } from 'alaska';

class LinkService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-link';
    super(options);
  }
}

export default new LinkService();
