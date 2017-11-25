// @flow

import { Service } from 'alaska';

class EventService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-event';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

export default new EventService();
