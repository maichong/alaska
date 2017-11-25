// @flow

import { Sled } from 'alaska';
import service from '../';
import EmailTask from '../models/EmailTask';

export default class ResumeTask extends Sled {
  async exec(params: {
    emailTask:EmailTask
  }): Promise<EmailTask> {
    let task = params.emailTask;

    if (task.state !== 2) {
      service.error('Error state');
    }

    task.state = 1;

    await task.save();

    return task.toObject();
  }
}
