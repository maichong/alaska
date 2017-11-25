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
}

export default new PostService();
