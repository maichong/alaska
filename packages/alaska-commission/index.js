// @flow

import alaska, { Service } from 'alaska';

class CommissionService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-commission';
    super(options);
  }

  postLoadConfig() {
    alaska.main.applyConfig({
      middlewares: {
        promoter: {
          fn: require('./middlewares/promoter'), // eslint-disable-line global-require
          sort: 0,
          options: {
            queryKey: this.getConfig('queryKey'),
            cookieOptions: this.getConfig('cookieOptions')
          }
        }
      }
    });
  }
}

export default new CommissionService();
