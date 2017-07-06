// @flow

import { Service } from 'alaska';

class FavoriteService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.id = options.id || 'alaska-favorite';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

export default new FavoriteService();
