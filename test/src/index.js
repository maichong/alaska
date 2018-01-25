process.title = 'alaska-test';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (!process.env.DB) {
  if (process.env.MONGO_PORT_27017_TCP_ADDR) {
    process.env.DB = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + '/alaska-test';
  } else {
    process.env.DB = 'mongodb://localhost/alaska-test';
  }
}

import { Service } from '../modules/alaska';

class MainService extends Service {
}

export default new MainService({
  id: 'test',
  dir: __dirname
});
