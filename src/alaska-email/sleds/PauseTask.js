// @flow

import { Sled } from 'alaska';
import service from '../';
import EmailTask from '../models/EmailTask';

export default class PauseTask extends Sled {
  async exec(params: {
    emailTask:EmailTask;
  }): Promise<EmailTask> {
    let task = params.emailTask;

    if (task.state !== 1) {
      service.error('Error state');
    }

    task.state = 2;

    await task.save();

    return task.toObject();
  }
}
