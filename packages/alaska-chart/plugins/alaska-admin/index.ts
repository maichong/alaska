import * as _ from 'lodash';
import { Plugin } from 'alaska';
import { AdminService } from 'alaska-admin';
import * as AdminView from 'alaska-admin-view';
import chartService from '../..';

export default class ChartPlugin extends Plugin {
  constructor(service: AdminService) {
    super(service);

    service.post('settings', (res: void, settings: AdminView.Settings) => {
      let model = _.get(settings, 'services.alaska-chart.models.Series');
      if (model) {
        chartService.keyParsers.forEach((fn, key) => {
          if (!_.find(model.fields.keyParser.options, ({ value }) => value === key)) {
            model.fields.keyParser.options.push({ label: key, value: key });
          }
        });
        chartService.valueParsers.forEach((fn, key) => {
          if (!_.find(model.fields.valueParser.options, ({ value }) => value === key)) {
            model.fields.valueParser.options.push({ label: key, value: key });
          }
        });
      }
    });
  }
}
