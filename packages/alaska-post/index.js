// @flow

import { Service } from 'alaska';

/**
 * @class PostService
 */
class PostService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-post';
    super(options);
  }

  preLoadConfig() {
    let ADMIN = this.alaska.service('alaska-admin', true);
    if (ADMIN) {
      ADMIN.addConfigDir(this.dir + '/config/alaska-admin');
    }
  }
}

export default new PostService();
