import { Service, PluginConfig } from '.';

export default class Plugin<T extends PluginConfig = any> {
  static readonly classOfPlugin = true;
  readonly instanceOfPlugin: true;
  service: Service;
  config: T;

  constructor(config: T, service: Service) {
    this.instanceOfPlugin = true;
    this.service = service;
    this.config = config;
  }
}
