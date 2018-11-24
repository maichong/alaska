
import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { Service, ServiceOptions } from 'alaska';

class ClientService extends Service {

  constructor(options?: ServiceOptions) {
    options = options || { configFileName: '', id: '' };
    options.id = options.id || 'alaska-client';
    options.configFileName = options.configFileName || __dirname;
    super(options);
  }
}

export default new ClientService();
