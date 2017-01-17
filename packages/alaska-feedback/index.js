// @flow

import { Service } from 'alaska';

/**
 * @class FeedbackService
 */
class FeedbackService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.id = options.id || 'alaska-feedback';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

export default new FeedbackService();
