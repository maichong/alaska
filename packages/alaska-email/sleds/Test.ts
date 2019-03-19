import { Sled } from 'alaska-sled';
import { ActionSledParams } from 'alaska-admin';
import Email from '../models/Email';
import Send from './Send';

interface Params extends ActionSledParams {
  record: Email;
}

export default class Test extends Sled<Params, Email> {
  async exec(params: Params) {
    let record = params.record;
    await Send.run({
      email: record,
      to: params.body.testTo,
      values: params.body.testData
    }, { dbSession: this.dbSession });
    return record;
  }
}
