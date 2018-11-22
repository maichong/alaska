import { Driver } from 'alaska';
import { QueueDriverOptions } from '.';

export default class QueueDriver<T, O extends QueueDriverOptions, D> extends Driver<O, D> {
  static readonly classOfQueueDriver = true;
  readonly instanceOfQueueDriver = true;
}
