// @flow

import { Service } from 'alaska';

/**
 * @class ImageService
 */
class ImageService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-image';
    super(options);
  }
}

export default new ImageService();
