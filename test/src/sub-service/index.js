import { Service } from '../../modules/alaska';

class SubService extends Service {
}

export default new SubService({
  id: 'sub',
  dir: __dirname
});
