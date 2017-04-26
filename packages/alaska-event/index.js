// @flow

import { Service } from 'alaska';

class EventService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.id = options.id || 'alaska-event';
    options.dir = options.dir || __dirname;
    super(options, alaska);
  }
}

export default new EventService();
