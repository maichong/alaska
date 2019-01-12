
import * as _ from 'lodash';
import { Service, ServiceOptions } from 'alaska';
import { KeyParser, ValueParser } from '.';
import * as keys from './parsers/key';
import * as values from './parsers/value';

class ChartService extends Service {
  keyParsers: Map<string, KeyParser>;
  valueParsers: Map<string, ValueParser>;

  constructor(options: ServiceOptions) {
    super(options);

    this.keyParsers = new Map();
    this.valueParsers = new Map();

    _.forEach(keys, (fn, name) => {
      if (name[0] === '_') return;
      this.keyParsers.set(name, fn);
    });

    _.forEach(values, (fn, name) => {
      if (name[0] === '_') return;
      this.valueParsers.set(name, fn);
    });

    this.resolveConfig().then((config) => {
      _.forEach(config.get('keyParsers'), (fn, name) => {
        this.keyParsers.set(name, fn);
      });
      _.forEach(config.get('valueParsers'), (fn, name) => {
        this.valueParsers.set(name, fn);
      });
    });
  }
}

export default new ChartService({
  id: 'alaska-chart'
});
