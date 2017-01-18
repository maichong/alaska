// @flow

import { Service } from 'alaska';

class LogService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-log';
    super(options);
  }
}

export default new LogService();
