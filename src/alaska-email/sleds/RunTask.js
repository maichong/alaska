// @flow

import { Sled } from 'alaska';
import service from '../';
import EmailTask from '../models/EmailTask';

export default class RunTask extends Sled {
  async exec(params: {
    emailTask:EmailTask;
  }): Promise<EmailTask> {
    let task = params.emailTask;

    if (task.state !== 0) {
      service.error('Error state');
    }

    task.state = 1;

    await task.save();

    return task.toObject();
  }
}
