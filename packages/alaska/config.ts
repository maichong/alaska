import * as _ from 'lodash';
import { Service, ConfigData } from '.';
import * as utils from './utils';

export default class Config {
  static readonly classOfConfig = true;
  static readonly defaultConfig: ConfigData = {
    env: 'production',
    extensions: {},
    plugins: {},
    services: {},
    prefix: '',
    apiPrefix: '/api'
  };
  readonly instanceOfConfig: true;
  readonly service: Service;
  readonly values: ConfigData;

  constructor(service: Service) {
    this.service = service;
    this.instanceOfConfig = true;
    this.values = _.cloneDeep(Config.defaultConfig);
  }

  static applyData(data: ConfigData, config: any): ConfigData {
    utils.merge(data, config);
    return data;
  }

  get(key: string, defaultValue?: any, mainAsDefault?: boolean): any {
    let value = _.get(this.values, key, defaultValue);
    if (mainAsDefault && !this.service.isMain() && (value === null || typeof value === 'undefined')) {
      value = this.service.main.config.get(key);
    }
    return value;
  }

  apply(config: any) {
    this.service.debug('apply config', config);
    Config.applyData(this.values, config);
  }
}
