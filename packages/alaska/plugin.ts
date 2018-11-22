import { Service } from '.';

export default class Plugin {
  static readonly classOfPlugin = true;
  readonly instanceOfPlugin: true;
  service: Service;

  constructor(service: Service) {
    this.service = service;
    this.instanceOfPlugin = true;
  }
}
