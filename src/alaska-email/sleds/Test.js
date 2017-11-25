// @flow

import { Sled } from 'alaska';
import service from '../';

export default class Test extends Sled {
  async exec(params: Object): Promise<Object> {
    let email = params.email;
    await service.run('Send', {
      email,
      to: params.body.testTo,
      values: params.body.testData
    });
    return email.toObject();
  }
}
