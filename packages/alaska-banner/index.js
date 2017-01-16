
import alaska from 'alaska';

class BannerService extends alaska.Service {
  constructor(options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-banner';
    super(options);
  }
}

export default new BannerService();
