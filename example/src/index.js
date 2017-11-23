/* eslint import/first:0 */

process.title = 'example';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (!process.env.DB) {
  if (process.env.MONGO_PORT_27017_TCP_ADDR) {
    process.env.DB = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + '/alaska-example';
  } else {
    process.env.DB = 'mongodb://localhost/alaska-example';
  }
}

import { Service } from 'alaska';

class MainService extends Service {
}

export default new MainService({
  id: 'example',
  dir: __dirname
});
