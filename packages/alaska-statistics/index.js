// @flow

import _ from 'lodash';
import alaska, { Service } from 'alaska';

export const views = {
  AxisSelector: __dirname + '/views/AxisSelector',
  ChartReview: __dirname + '/views/ChartReview',
  Chart: __dirname + '/views/Chart'
};

/**
 * @class StatisticsService
 */
class StatisticsService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-statistics';
    super(options);
  }

  postLoadConfig() {
    let ADMIN = alaska.service('alaska-admin', true);
    if (ADMIN) {
      ADMIN.addConfigDir(__dirname + '/config/alaska-admin');
    }
  }

  postLoadModels() {
    let reducers = this.config('reducers');
    if (_.isEmpty(reducers)) return;
    const ChartSource = this.model('ChartSource');
    _.forEach(reducers, (reducer, key) => {
      let options = _.omit(reducer, 'fn', 'final');
      options.value = key;
      // $Flow ChartSource.fields.reducer.options flow报错为undefined
      ChartSource.fields.reducer.options.push(options);
    });
  }

  async settings(ctx: Alaska$Context, user: User, settings: Object) {
    if (!settings.services['alaska-statistics']) return;
    let options = [];
    _.forEach(settings.services, (service) => {
      if (service.id === 'alaska-statistics') return;
      _.forEach(service.models, (Model) => {
        if (Model.hidden) return;
        options.push({ label: Model.label, value: Model.path });
      });
    });
    settings.services['alaska-statistics'].models.ChartSource.fields.model.options = options;
  }

  postMount() {
    setTimeout(() => this.run('AutoBuild'), 5000);
    setInterval(() => this.run('AutoBuild'), 60 * 1000);
  }
}

export default new StatisticsService();
