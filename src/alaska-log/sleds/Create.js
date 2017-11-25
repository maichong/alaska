// @flow

import { Sled } from 'alaska';
import Log from '../models/Log';

export default class Create extends Sled {
  async exec(params: Object): Object {
    let log = new Log(params);
    await log.save();
    return log;
  }
}
