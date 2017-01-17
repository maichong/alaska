// @flow

import { Service } from 'alaska';

class FavoriteService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.id = options.id || 'alaska-favorite';
    options.dir = options.dir || __dirname;
    super(options, alaska);
  }
}

export default new FavoriteService();
