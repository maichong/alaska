import { Plugin, Service } from 'alaska';

export default class UserPlugin extends Plugin {
  constructor(service: Service) {
    super(service);
    console.log('UserPlugin');
  }
}
