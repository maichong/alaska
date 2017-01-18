// @flow

import { Service } from 'alaska';

/**
 * @class PostService
 */
class PostService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-post';
    super(options);
  }

  preLoadConfig() {
    let ADMIN = this.alaska.service('alaska-admin', true);
    if (ADMIN) {
      ADMIN._configDirs.push(this.dir + '/config/alaska-admin');
    }
  }
}

export default new PostService();
