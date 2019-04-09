import { Driver } from 'alaska';
import { QueueDriverConfig } from '.';

export default class QueueDriver<T, C extends QueueDriverConfig, D> extends Driver<C, D> {
  static readonly classOfQueueDriver = true;
  readonly instanceOfQueueDriver = true;
}
