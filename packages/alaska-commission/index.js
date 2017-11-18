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
      '+appMiddlewares': [{
        id: `${__dirname}/middlewares/promoter.js`,
        sort: 0,
        options: {
          queryKey: this.config('queryKey'),
          cookieOptions: this.config('cookieOptions')
        }
      }]
    });
  }
}

export default new CommissionService();
