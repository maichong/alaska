import { Service } from 'alaska';

class BannerService extends Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-banner';
    super(options);
  }
}

export default new BannerService();
