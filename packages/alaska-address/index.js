// @flow

import { Service } from 'alaska';

class AddressService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-address';
    super(options);
  }
}

export default new AddressService();
